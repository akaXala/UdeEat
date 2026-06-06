import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

// Componentes
import Header from '@/components/ui/Header';
import RestaurantCard from '@/components/ui/RestaurantCard';

// Colores
import { Colors } from '@/constants/Colors';
import { useTabSlideAnimation } from '@/hooks/use-tab-slide-animation';

// Servicios (NUEVO)
import { getRestaurants, type Restaurant } from '@/services/menu-catalog';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const slideStyle = useTabSlideAnimation();

  // Estado para manejar los restaurantes que vienen de la API
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // Hook para cargar los datos cuando la pantalla se abre
  useEffect(() => {
    let isMounted = true;

    async function fetchRestaurants() {
      setLoading(true);
      const data = await getRestaurants();
      if (isMounted) {
        setRestaurants(data);
        setLoading(false);
      }
    }

    fetchRestaurants();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      {/* Usamos el componente Header */}
      <Header />

      <Animated.View style={[styles.animatedContent, slideStyle]}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.text, marginTop: 10 }}>Cargando restaurantes...</Text>
            </View>
          ) : restaurants.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={{ color: colors.text }}>No se encontraron restaurantes.</Text>
            </View>
          ) : (
            <View style={styles.cardsContainer}>
              {restaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id} // Es más seguro usar el ID como key
                  nombre={restaurant.nombre}
                  categoria={restaurant.categoria}
                  rating={restaurant.rating}
                  tiempo={restaurant.tiempo}
                  imagen={restaurant.imagen}
                  onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                />
              ))}
            </View>
          )}
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
    alignItems: 'stretch',
  },
  loadingContainer: {
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  }
});