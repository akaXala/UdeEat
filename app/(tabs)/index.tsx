import { useRouter } from 'expo-router';
import React from 'react';
import { Animated, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';

// Componentes
import Header from '@/components/ui/Header';
import RestaurantCard from '@/components/ui/RestaurantCard';

// Colores
import { Colors } from '@/constants/Colors';
import { restaurants } from '@/constants/restaurants';
import { useTabSlideAnimation } from '@/hooks/use-tab-slide-animation';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const slideStyle = useTabSlideAnimation();

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      {/* Usamos el componente Header */}
      <Header />

      <Animated.View style={[styles.animatedContent, slideStyle]}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.cardsContainer}>
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.nombre}
                nombre={restaurant.nombre}
                categoria={restaurant.categoria}
                rating={restaurant.rating}
                tiempo={restaurant.tiempo}
                imagen={restaurant.imagen}
                onPress={() => router.push(`/restaurant/${restaurant.id}`)}
              />
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  animatedContent: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 130,
  },
  cardsContainer: {
    alignItems: 'center',
  },
});