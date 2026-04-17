import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

import FoodCard from '@/components/ui/FoodCard';
import { Colors } from '@/constants/Colors';
import { type Restaurant, getRestaurantById } from '@/services/menu-catalog';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [restaurant, setRestaurant] = useState<Restaurant | undefined | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRestaurant() {
      if (!id) {
        return;
      }

      const response = await getRestaurantById(id);
      if (isMounted) {
        setRestaurant(response);
      }
    }

    loadRestaurant();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (restaurant === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}> 
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary }]}>Volver</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Cargando restaurante...</Text>
        </View>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}> 
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary }]}>Volver</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Restaurante no encontrado</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}> 
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>Volver</Text>
        </Pressable>
        <View style={styles.titleWrap}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {restaurant.nombre}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {restaurant.categoria} • {restaurant.tiempo}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {restaurant.menu.map((food) => (
          <FoodCard
            key={food.id}
            nombre={food.nombre}
            precioCop={food.precioCop}
            calorias={food.calorias}
            rating={food.rating}
            imagen={food.imagen}
            onPress={() => router.push(`/restaurant/${restaurant.id}/food/${food.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 12,
    gap: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
  },
  titleWrap: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
});
