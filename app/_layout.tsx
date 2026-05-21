import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

import { AppPreferencesProvider, useAppPreferences } from '@/services/app-preferences';
import { findPendingDeliveredOrder, getOrderRatings } from '@/services/order-ratings';
import { getOrders } from '@/services/orders';

// Clerk
import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';

export const unstable_settings = {
  anchor: '(tabs)',
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Añade EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY a tu archivo .env');
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AppPreferencesProvider>
        <AppThemeShell />
      </AppPreferencesProvider>
    </ClerkProvider>
    
  );
}

function AppThemeShell() {
  const systemColorScheme = useColorScheme();
  const { preferences } = useAppPreferences();
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  const router = useRouter();
  const pathname = usePathname();
  const [promptedOrderId, setPromptedOrderId] = useState<string | null>(null);

  const resolvedScheme =
    preferences.themeMode === 'system' ? systemColorScheme : preferences.themeMode;

  useEffect(() => {
    let mounted = true;

    async function checkPendingOrderRating() {
      if (!isLoaded || !isSignedIn) {
        return;
      }

      const [orders, ratings] = await Promise.all([getOrders(), getOrderRatings()]);
      if (!mounted) {
        return;
      }

      const pending = findPendingDeliveredOrder(orders, ratings);
      if (!pending || promptedOrderId === pending.id || pathname === '/rate-order') {
        return;
      }

      setPromptedOrderId(pending.id);
      router.push({ pathname: '/rate-order', params: { orderId: pending.id } });
    }

    checkPendingOrderRating();

    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn, pathname, promptedOrderId, router]);

  return (
    <ThemeProvider value={resolvedScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });

  return (
    <Stack>
      <Stack.Screen name="oauth-native-callback" options={{ headerShown: false }} />

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={Boolean(isLoaded && isSignedIn)}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="cart" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="rate-order" options={{ headerShown: false, presentation: 'transparentModal' }} />
        <Stack.Screen name="restaurant/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="restaurant/[id]/food/[foodId]" options={{ headerShown: false }} />
        <Stack.Screen name="orders/[orderId]" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
