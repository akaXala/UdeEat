import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { useColorScheme, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
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
  const { isLoaded, isSignedIn, getToken } = useAuth({ treatPendingAsSignedOut: false });
  const router = useRouter();
  const pathname = usePathname();
  const [promptedOrderId, setPromptedOrderId] = useState<string | null>(null);

  const lastStatusesRef = useRef<Record<string, string>>({});
  const isInitialLoadRef = useRef(true);

  const resolvedScheme =
    preferences.themeMode === 'system' ? systemColorScheme : preferences.themeMode;

  useEffect(() => {
    let mounted = true;

    async function checkPendingOrderRating() {
      // El módulo de calificación está deshabilitado temporalmente debido a la falta de endpoints en el backend
      return;
    }

    checkPendingOrderRating();

    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn, pathname, promptedOrderId, router]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      isInitialLoadRef.current = true;
      lastStatusesRef.current = {};
      return;
    }

    let mounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    const statusLabel: Record<string, string> = {
      draft: 'Borrador',
      placed: 'Recibida',
      preparing: 'En preparación',
      ready: 'Listo para recoger',
      delivered: 'Entregada',
      cancelled: 'Cancelada',
    };

    async function pollOrders() {
      try {
        const token = await getToken();
        if (!mounted) return;
        const orders = await getOrders(token);
        if (!mounted) return;

        const nextStatuses: Record<string, string> = {};
        orders.forEach((order) => {
          nextStatuses[order.id] = order.status;

          if (!isInitialLoadRef.current) {
            const prevStatus = lastStatusesRef.current[order.id];
            if (prevStatus && prevStatus !== order.status) {
              if (preferences.notificationsEnabled) {
                Alert.alert(
                  'Actualización de tu pedido',
                  `El estado de tu pedido #${order.number} de "${order.restaurantName}" ha cambiado a: ${statusLabel[order.status] ?? order.status}.`
                );
              }
              if (preferences.vibrationEnabled) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            }
          }
        });

        lastStatusesRef.current = nextStatuses;
        isInitialLoadRef.current = false;
      } catch (error) {
        console.warn('[RootLayout] Error polling orders:', error);
      }
    }

    // Ejecución inicial rápida
    pollOrders();

    pollInterval = setInterval(pollOrders, 7000);

    return () => {
      mounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isLoaded, isSignedIn, preferences.notificationsEnabled, preferences.vibrationEnabled]);

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
