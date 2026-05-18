import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

import { AppPreferencesProvider, useAppPreferences } from '@/services/app-preferences';

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

  const resolvedScheme =
    preferences.themeMode === 'system' ? systemColorScheme : preferences.themeMode;

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
        <Stack.Screen name="restaurant/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="restaurant/[id]/food/[foodId]" options={{ headerShown: false }} />
        <Stack.Screen name="orders/[orderId]" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
