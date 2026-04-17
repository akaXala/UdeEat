import React from 'react';
import { Animated, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';

// Componentes
import Header from '@/components/ui/Header';
import RestaurantCard from '@/components/ui/RestaurantCard';

// Colores
import { Colors } from '@/constants/Colors';
import { useTabSlideAnimation } from '@/hooks/use-tab-slide-animation';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const slideStyle = useTabSlideAnimation();

  return (
    <Animated.View style={[styles.mainContainer, { backgroundColor: colors.background }, slideStyle]}>
      
      {/* Usamos el componente Header */}
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cardsContainer}>
          <RestaurantCard />
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  cardsContainer: {
    alignItems: 'center',
  },
});