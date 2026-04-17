import React from 'react';
import { Animated, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';

// Componentes
import Header from '@/components/ui/Header';
import RestaurantCard from '@/components/ui/RestaurantCard';

// Colores
import { Colors } from '@/constants/Colors';
import { useTabSlideAnimation } from '@/hooks/use-tab-slide-animation';

const restaurants = [
  {
    nombre: 'La Parrilla de la UdeA',
    categoria: 'Comida Internacional',
    rating: 4.8,
    tiempo: '15-25 min',
    imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop',
  },
  {
    nombre: 'Sabor UdeA',
    categoria: 'Comida Colombiana',
    rating: 4.7,
    tiempo: '18-28 min',
    imagen: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=1200&auto=format&fit=crop',
  },
  {
    nombre: 'Nori UdeA',
    categoria: 'Sushi y Japonesa',
    rating: 4.9,
    tiempo: '20-30 min',
    imagen: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1200&auto=format&fit=crop',
  },
  {
    nombre: 'Trattoria Universitaria UdeA',
    categoria: 'Italiana',
    rating: 4.6,
    tiempo: '25-35 min',
    imagen: 'https://images.unsplash.com/photo-1521389508051-d7ffb5dc8d70?q=80&w=1200&auto=format&fit=crop',
  },
  {
    nombre: 'Taco UdeA',
    categoria: 'Mexicana',
    rating: 4.5,
    tiempo: '15-22 min',
    imagen: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    nombre: 'Green UdeA Bowl',
    categoria: 'Saludable y Bowls',
    rating: 4.8,
    tiempo: '12-20 min',
    imagen: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop',
  },
];

export default function HomeScreen() {
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