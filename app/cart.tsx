import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, View, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import Header from '@/components/ui/Header';
import { Colors } from '@/constants/Colors';
import { clearCart, removeFromCart, useCartItems } from '@/services/cart';

function formatCop(value: number) {
  return `$${value.toLocaleString('es-CO')} COP`;
}

export default function CartScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const items = useCartItems();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <ThemedText style={[styles.title, { color: colors.text }]}>Carrito</ThemedText>
          <ThemedText style={{ color: colors.textSecondary }}>{items.length} productos</ThemedText>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={48} color={colors.textSecondary} />
            <ThemedText style={{ color: colors.textSecondary, textAlign: 'center' }}>
              Aún no has agregado productos.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => `${item.id}-${item.sizeLabel ?? 'default'}`}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  const key = `${item.id}-${item.sizeLabel ?? 'default'}`;
                  setExpandedKey((current) => (current === key ? null : key));
                }}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.imageWrap}>
                    {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : <View style={[styles.image, { backgroundColor: colors.border }]} />}
                  </View>

                  <View style={styles.cardMain}>
                    <ThemedText style={[styles.itemName, { color: colors.text }]}>{item.name}</ThemedText>
                    {item.sizeLabel ? <ThemedText style={{ color: colors.textSecondary }}>{item.sizeLabel}</ThemedText> : null}
                    <ThemedText style={{ color: colors.textSecondary }}>Cantidad: {item.quantity}</ThemedText>
                    <ThemedText style={{ color: colors.primary }}>{formatCop(item.unitPrice * item.quantity)}</ThemedText>
                  </View>

                  <Pressable
                    onPress={() => removeFromCart(item.id, item.sizeLabel)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </Pressable>
                </View>

                {expandedKey === `${item.id}-${item.sizeLabel ?? 'default'}` ? (
                  <View style={[styles.details, { borderTopColor: colors.border }]}> 
                    {item.restaurantName ? <ThemedText style={{ color: colors.textSecondary }}>Local: {item.restaurantName}</ThemedText> : null}
                    {item.sizeLabel ? <ThemedText style={{ color: colors.textSecondary }}>Personalización: {item.sizeLabel}</ThemedText> : null}
                    {item.ingredients?.length ? (
                      <ThemedText style={{ color: colors.textSecondary }}>Ingredientes: {item.ingredients.join(', ')}</ThemedText>
                    ) : null}
                    {item.extras?.length ? (
                      <ThemedText style={{ color: colors.textSecondary }}>Extras: {item.extras.join(', ')}</ThemedText>
                    ) : null}
                  </View>
                ) : null}
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
        <View>
          <ThemedText style={{ color: colors.textSecondary }}>Total</ThemedText>
          <ThemedText type="subtitle" style={{ color: colors.text }}>{formatCop(total)}</ThemedText>
        </View>

        <Pressable
          style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)/ordenes')}
        >
          <ThemedText style={styles.checkoutText}>Ir a pedidos</ThemedText>
        </Pressable>
      </View>

      {items.length > 0 ? (
        <Pressable style={styles.clearButton} onPress={clearCart}>
          <ThemedText style={{ color: colors.error, fontWeight: '700' }}>Vaciar carrito</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 },
  title: { fontSize: 30, fontWeight: '800' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  listContent: { paddingBottom: 16 },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center' },
  imageWrap: {
    marginRight: 12,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  cardMain: { flex: 1, gap: 4 },
  itemName: { fontSize: 18, fontWeight: '700' },
  removeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  details: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 6,
  },
  footer: {
    borderTopWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  checkoutButton: {
    paddingHorizontal: 18,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutText: { color: '#fff', fontWeight: '800' },
  clearButton: { alignItems: 'center', paddingBottom: 16 },
});
