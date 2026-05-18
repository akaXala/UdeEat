import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import Header from '@/components/ui/Header';
import OrderDetailItem from '@/components/ui/OrderDetailItem';
import { Colors } from '@/constants/Colors';
import { getOrderById, Order } from '@/services/orders';
import { Ionicons } from '@expo/vector-icons';

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const router = useRouter();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let mounted = true;
    getOrderById(orderId).then((o) => {
      if (mounted) setOrder(o);
    });
    return () => {
      mounted = false;
    };
  }, [orderId]);

  function formatCop(value: number) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
  }

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header />
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText>Cargando orden…</ThemedText>
        </ScrollView>
      </View>
    );
  }

  const titleMap: Record<string, string> = {
    delivered: 'Orden entregada',
    preparing: 'Orden en preparación',
    waiting: 'Orden recibida',
    ready: 'Listo para recoger',
    cancelled: 'Orden cancelada',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Header />

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
          <ThemedText style={[styles.backText, { color: colors.primary }]}>Volver</ThemedText>
        </Pressable>

        <View style={styles.heroRow}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}> 
            <Ionicons name={order.status === 'delivered' ? 'checkmark-done' : order.status === 'ready' ? 'checkmark-circle' : 'time'} size={28} color="white" />
          </View>

          <View style={styles.heroText}>
            <ThemedText style={[styles.heroTitle, { color: colors.text }]}>{titleMap[order.status] ?? 'Orden'}</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>Orden #{order.number} • {new Date(order.placedAt).toLocaleDateString('es-CO')}</ThemedText>
            <ThemedText style={[styles.restaurant, { color: colors.textSecondary }]}>{order.restaurantName}</ThemedText>
          </View>
        </View>

        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Tu orden</ThemedText>
        <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>Items</ThemedText>

        {order.items.map((it) => (
          <OrderDetailItem
            key={it.id}
            image={it.image}
            name={it.name}
            category={it.category}
            quantity={it.quantity}
            unitPrice={it.unitPrice}
            ingredients={it.ingredients}
            extras={it.extras}
          />
        ))}

        <View style={{ height: 8 }} />

        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Resumen de pago</ThemedText>
        <View style={styles.summaryRow}>
          <ThemedText style={{ color: colors.textSecondary }}>Total:</ThemedText>
          <ThemedText style={[styles.total, { color: colors.primary }]}>{formatCop(order.total)}</ThemedText>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },
  backButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, marginBottom: 14 },
  backText: { fontSize: 16, fontWeight: '700' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  heroText: { marginLeft: 8 },
  heroTitle: { fontSize: 28, fontWeight: '800', lineHeight: 32 },
  subtitle: { fontSize: 15, marginTop: 6 },
  restaurant: { fontSize: 14, marginTop: 6 },
  sectionTitle: { fontSize: 22, fontWeight: '800', marginTop: 14, marginBottom: 4 },
  sectionLabel: { fontSize: 13, marginTop: 8, marginBottom: 6 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' },
  total: { fontSize: 18, fontWeight: '700' },
});
