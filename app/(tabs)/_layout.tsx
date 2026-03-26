// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

// Importamos tu componente personalizado
import CustomTabBar from '@/components/ui/CustomTabBar';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Tabs
      // --- LA CLAVE ---
      // Le pasamos nuestro componente personalizado
      tabBar={(props) => <CustomTabBar {...props} />}
      
      // Configuraciones globales para todas las pantallas de Tabs
      screenOptions={{
        headerShown: false, // Ocultamos el header automático, ya usamos el tuyo componetizado
      }}
    >
      {/* Las pantallas que viven en la barra de navegación */}
      {/* Los nombres deben coincidir con los archivos y con iconMap en CustomTabBar.tsx */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="ordenes"
        options={{
          title: 'Pedidos',
        }}
      />
    </Tabs>
  );
}