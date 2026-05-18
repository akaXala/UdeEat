import React, { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import Header from '@/components/ui/Header';
import OrderListCard from '@/components/ui/OrderListCard';
import { Colors } from '@/constants/Colors';
import { useTabSlideAnimation } from '@/hooks/use-tab-slide-animation';
import { getOrders, Order } from '@/services/orders';
import { useRouter } from 'expo-router';

export default function OrdenesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const slideStyle = useTabSlideAnimation();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [active, setActive] = useState<'inprogress' | 'past'>('inprogress');

  useEffect(() => {
    let mounted = true;
    getOrders().then((data) => {
      if (mounted) setOrders(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const inProgressStatuses = ['waiting', 'preparing', 'ready'];
  const inProgress = orders.filter((o) => inProgressStatuses.includes(o.status));
  const past = orders.filter((o) => !inProgressStatuses.includes(o.status));

  function formatDate(iso?: string) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('es-CO');
    } catch {
      return iso;
    }
  }

  const statusLabel: Record<string, string> = {
    waiting: 'En espera',
    preparing: 'Preparando',
    ready: 'Listo para recoger',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Header />
      <Animated.View style={[styles.animatedContent, slideStyle]}> 
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={{ color: colors.text }}>Ordenes</ThemedText>

          <View style={styles.segmentRow}>
            <TouchableOpacity style={styles.segmentItem} onPress={() => setActive('inprogress')}>
              <ThemedText style={ active === 'inprogress' ? [styles.segmentActive, { color: colors.primary }] : [styles.segmentLabel, { color: colors.textSecondary }] }>EN PROGRESO</ThemedText>
              <View style={ active === 'inprogress' ? [styles.underline, { backgroundColor: colors.primary }] : [styles.underlineGhost, { backgroundColor: colors.border }]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.segmentItem} onPress={() => setActive('past')}>
              <ThemedText style={ active === 'past' ? [styles.segmentActive, { color: colors.primary }] : [styles.segmentLabel, { color: colors.textSecondary }] }>ORDENES PASADAS</ThemedText>
              <View style={ active === 'past' ? [styles.underline, { backgroundColor: colors.primary }] : [styles.underlineGhost, { backgroundColor: colors.border }]} />
            </TouchableOpacity>
          </View>

          <View style={styles.listWrap}>
            {(active === 'inprogress' ? inProgress : past).map((order) => (
              <View key={order.id}>
                <OrderListCard
                  id={order.id}
                  number={order.number}
                  status={order.status}
                  subtitle={statusLabel[order.status] ?? order.status}
                  date={formatDate(order.placedAt)}
                  onPress={() => router.push(`/orders/${order.id}`)}
                />
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </View>
            ))}

            {((active === 'inprogress' ? inProgress : past).length === 0) && (
              <ThemedText style={[styles.empty, { color: colors.textSecondary }]}>No hay órdenes en esta sección.</ThemedText>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  animatedContent: { flex: 1, overflow: 'hidden' },
  content: { padding: 16, gap: 8 },
  segmentRow: { flexDirection: 'row', marginTop: 8, marginBottom: 6 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  segmentLabel: { fontSize: 13, color: '#666' },
  segmentActive: { fontSize: 14, fontWeight: '600' },
  underline: { height: 3, backgroundColor: '#0b5ed7', width: '70%', marginTop: 8, borderRadius: 2 },
  underlineGhost: { height: 1, backgroundColor: '#e6e6e6', width: '100%', marginTop: 8 },
  listWrap: { marginTop: 10 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  empty: { marginTop: 16, color: '#666' },
  title: { marginBottom: 6 },
});
