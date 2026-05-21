import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

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

  const mapPreviewUrl = useMemo(() => {
    if (!restaurant) {
      return '';
    }

    const { latitude, longitude } = restaurant.location;
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=17&size=900x320&markers=${latitude},${longitude},red-pushpin`;
  }, [restaurant]);

  const directionsUrl = useMemo(() => {
    if (!restaurant) {
      return '';
    }

    const { latitude, longitude } = restaurant.location;
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
  }, [restaurant]);

  const openDirections = async () => {
    if (!directionsUrl) {
      return;
    }

    const supported = await Linking.canOpenURL(directionsUrl);
    if (supported) {
      await Linking.openURL(directionsUrl);
    }
  };

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
        <View style={[styles.mapCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <View style={styles.mapHeader}>
            <View style={styles.mapHeaderText}>
              <Text style={[styles.mapTitle, { color: colors.text }]}>Ubicación</Text>
              <Text style={[styles.mapSubtitle, { color: colors.textSecondary }]}>{restaurant.location.label}</Text>
            </View>

            <Pressable style={[styles.routeButton, { backgroundColor: colors.primary }]} onPress={openDirections}>
              <Text style={styles.routeButtonText}>Cómo llegar</Text>
            </Pressable>
          </View>

          <View style={styles.mapPreviewWrap}>
            <Image source={{ uri: mapPreviewUrl }} style={styles.mapPreview} />
            <View style={[styles.mapOverlay, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
            <View style={[styles.mapPin, { backgroundColor: colors.primary }]}>
              <Text style={styles.mapPinText}>📍</Text>
            </View>
          </View>
        </View>

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
    gap: 12,
  },
  mapCard: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 6,
  },
  mapHeader: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  mapHeaderText: {
    flex: 1,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  mapSubtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  routeButton: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
  mapPreviewWrap: {
    height: 220,
    position: 'relative',
  },
  mapPreview: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPin: {
    position: 'absolute',
    top: '42%',
    left: '49%',
    width: 42,
    height: 42,
    marginLeft: -21,
    marginTop: -21,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  mapPinText: {
    fontSize: 18,
  },
});
