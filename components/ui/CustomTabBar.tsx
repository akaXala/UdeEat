import { Colors } from '@/constants/Colors';
import { setPendingTabSlideDirection } from '@/hooks/use-tab-slide-animation';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Keyboard, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import AccountDrawer from '@/components/ui/AccountDrawer';
import FloatingSearchBar from '@/components/ui/FloatingSearchBar';

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const tabBarProgress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(tabBarProgress, {
      toValue: isSearchOpen ? 0 : 1,
      duration: isSearchOpen ? 220 : 260,
      useNativeDriver: true,
    }).start();
  }, [isSearchOpen, tabBarProgress]);

  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    index: 'home-outline',
    buscar: 'search-outline',
    ordenes: 'receipt-outline',
    cuenta: 'person-outline',
  };

  const activeRouteName = state.routes[state.index]?.name;

  const actions = useMemo(
    () => [
      { key: 'index', label: 'Inicio' },
      { key: 'buscar', label: 'Buscar' },
      { key: 'ordenes', label: 'Pedidos' },
      { key: 'cuenta', label: 'Cuenta' },
    ],
    [],
  );

  const handleRouteNavigation = (routeName: 'index' | 'ordenes') => {
    const targetIndex = state.routes.findIndex((route) => route.name === routeName);
    if (targetIndex < 0) {
      return;
    }

    const targetRoute = state.routes[targetIndex];
    const event = navigation.emit({
      type: 'tabPress',
      target: targetRoute.key,
      canPreventDefault: true,
    });

    if (targetIndex !== state.index && !event.defaultPrevented) {
      const direction = targetIndex > state.index ? 'from-right' : 'from-left';
      setPendingTabSlideDirection(direction);
      navigation.navigate(routeName);
    }
  };

  const onActionPress = (key: string) => {
    if (key === 'buscar') {
      setIsAccountOpen(false);
      setIsSearchOpen(true);
      return;
    }

    if (key === 'cuenta') {
      Keyboard.dismiss();
      setIsSearchOpen(false);
      setIsAccountOpen(true);
      return;
    }

    setIsSearchOpen(false);
    setIsAccountOpen(false);
    handleRouteNavigation(key as 'index' | 'ordenes');
  };

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <Animated.View
        pointerEvents={isSearchOpen ? 'none' : 'auto'}
        style={[
          styles.tabBarWrapper,
          {
            opacity: tabBarProgress,
            transform: [
              {
                scale: tabBarProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.92, 1],
                }),
              },
              {
                translateY: tabBarProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={[styles.tabBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          {actions.map((action) => {
            const route = state.routes.find((item) => item.name === action.key);
            const options = route ? descriptors[route.key].options : undefined;
            const isFocusedRoute = action.key === activeRouteName;
            const isFocused = action.key === 'buscar' ? isSearchOpen : action.key === 'cuenta' ? isAccountOpen : isFocusedRoute;
            const iconName = iconMap[action.key] || 'ellipse-outline';
            const accessibilityLabel = options?.tabBarAccessibilityLabel ?? action.label;

            return (
              <TouchableOpacity
                key={action.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={accessibilityLabel}
                onPress={() => onActionPress(action.key)}
                style={styles.tabItem}
                activeOpacity={0.8}
              >
                <View style={styles.tabContent}>
                  {isFocused ? (
                    <Animated.View style={[styles.activeTabContainer, { backgroundColor: colors.tint }]}>
                      <Ionicons name={iconName} size={22} color={colorScheme === 'light' ? '#FFF' : '#10141C'} />
                      <Text style={[styles.activeLabel, { color: colorScheme === 'light' ? '#FFF' : '#10141C' }]} numberOfLines={1}>
                        {action.label}
                      </Text>
                    </Animated.View>
                  ) : (
                    <View style={styles.inactiveTabContainer}>
                      <Ionicons name={iconName} size={24} color={colors.textSecondary} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      <FloatingSearchBar
        visible={isSearchOpen}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClose={() => setIsSearchOpen(false)}
      />

      <AccountDrawer visible={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </View>
  );
};

// Estilos para lograr el efecto flotante y el diseño de la imagen de referencia
const styles = StyleSheet.create({
  // Contenedor principal para positioning absoluto
  container: {
    position: 'absolute',
    bottom: 25, // Distancia desde el fondo absoluto
    left: 20,
    right: 20,
    elevation: 10, // Sombra para Android
    zIndex: 1000,
  },
  // La barra en sí
  tabBarWrapper: {
    zIndex: 2,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 70, // Altura constante
    borderRadius: 35, // Bordes circulares completos
    borderTopWidth: 0, // Quitamos el borde superior por defecto
    paddingHorizontal: 10,
    // Sombras para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Diseño del ítem Inactivo
  inactiveTabContainer: {
    padding: 10,
  },
  // Diseño del ítem Activo (el circulito con color de acento)
  activeTabContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 4, // Espacio entre ícono y texto
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default CustomTabBar;