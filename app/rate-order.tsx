import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/Colors';
import { getOrderRating, saveOrderRating } from '@/services/order-ratings';
import { getOrderById, Order } from '@/services/orders';

function StarRating({ value, onChange, color }: { value: number; onChange: (value: number) => void; color: string }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onChange(star)} style={styles.starButton}>
          <Ionicons name={star <= value ? 'star' : 'star-outline'} size={28} color={star <= value ? color : '#999'} />
        </Pressable>
      ))}
    </View>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO');
}

export default function RateOrderScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [order, setOrder] = useState<Order | null>(null);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [restaurantRating, setRestaurantRating] = useState(5);
  const [itemRatings, setItemRatings] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!orderId) {
        return;
      }

      const [foundOrder, existingRating] = await Promise.all([getOrderById(orderId), getOrderRating(orderId)]);
      if (!mounted) {
        return;
      }

      setOrder(foundOrder);
      if (existingRating) {
        setAlreadyRated(true);
        setRestaurantRating(existingRating.restaurantRating);
        setItemRatings(existingRating.itemRatings);
        return;
      }

      if (foundOrder) {
        const initialRatings: Record<string, number> = {};
        foundOrder.items.forEach((item) => {
          initialRatings[item.id] = 5;
        });
        setItemRatings(initialRatings);
        setRestaurantRating(5);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  const canSubmit = useMemo(() => {
    if (!order || alreadyRated) {
      return false;
    }

    return order.items.every((item) => itemRatings[item.id] >= 1 && itemRatings[item.id] <= 5) && restaurantRating >= 1 && restaurantRating <= 5;
  }, [alreadyRated, itemRatings, order, restaurantRating]);

  if (!order) {
    return (
      <View style={[styles.screen, { backgroundColor: 'rgba(0,0,0,0.72)' }]}>
        <View style={[styles.sheet, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <ThemedText style={[styles.loading, { color: colors.text }]}>Cargando calificación...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Pressable style={styles.backdrop} onPress={() => router.back()} />

      <View style={[styles.sheet, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.handle} />

        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <ThemedText style={[styles.title, { color: colors.text }]}>Califica tu pedido</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>Orden #{order.number} • {formatDate(order.placedAt)}</ThemedText>
          </View>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.restaurantCard, { backgroundColor: colors.background, borderColor: colors.border }]}> 
            <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>Restaurant</ThemedText>
            <ThemedText style={[styles.restaurantName, { color: colors.text }]}>{order.restaurantName}</ThemedText>
            {order.items[0]?.image ? <Image source={{ uri: order.items[0].image }} style={styles.previewImage} /> : null}
          </View>

          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Califica el restaurant</ThemedText>
            <StarRating value={restaurantRating} onChange={setRestaurantRating} color={colors.star} />
          </View>

          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Califica cada platillo</ThemedText>
            {order.items.map((item) => (
              <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.background, borderColor: colors.border }]}> 
                <View style={styles.itemHeader}>
                  <View style={styles.itemMeta}>
                    <ThemedText style={[styles.itemName, { color: colors.text }]}>{item.name}</ThemedText>
                    {item.category ? <ThemedText style={{ color: colors.textSecondary }}>{item.category}</ThemedText> : null}
                  </View>
                  {item.image ? <Image source={{ uri: item.image }} style={styles.itemImage} /> : null}
                </View>
                <StarRating
                  value={itemRatings[item.id] ?? 5}
                  onChange={(value) => setItemRatings((prev) => ({ ...prev, [item.id]: value }))}
                  color={colors.star}
                />
              </View>
            ))}
          </View>

          {alreadyRated ? (
            <View style={[styles.alreadyRatedBox, { borderColor: colors.primary, backgroundColor: colors.background }]}> 
              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              <ThemedText style={{ color: colors.text }}>Ya calificaste esta orden una vez.</ThemedText>
            </View>
          ) : null}

          <Pressable
            disabled={!canSubmit || isSaving}
            onPress={async () => {
              if (!order || !canSubmit || isSaving) {
                return;
              }

              setIsSaving(true);
              const saved = await saveOrderRating({
                orderId: order.id,
                restaurantRating,
                itemRatings,
              });
              setIsSaving(false);

              if (!saved) {
                router.back();
                return;
              }

              router.back();
            }}
            style={[
              styles.submitButton,
              {
                backgroundColor: canSubmit && !isSaving ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={styles.submitText}>{isSaving ? 'Guardando...' : alreadyRated ? 'Ya calificada' : 'Enviar calificación'}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '88%',
    overflow: 'hidden',
  },
  handle: {
    width: 52,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#999',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
    opacity: 0.4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 18,
  },
  loading: {
    fontSize: 16,
    padding: 20,
  },
  restaurantCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '800',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 16,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  starRow: {
    flexDirection: 'row',
    gap: 4,
  },
  starButton: {
    padding: 2,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
    gap: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '800',
  },
  itemImage: {
    width: 54,
    height: 54,
    borderRadius: 14,
  },
  alreadyRatedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  submitButton: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
