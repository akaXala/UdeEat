import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { 
  ActivityIndicator,
  Alert,
  FlatList, 
  Image, 
  Modal,
  Pressable, 
  StyleSheet, 
  Text,
  TouchableOpacity,
  View, 
  useColorScheme 
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import Header from '@/components/ui/Header';
import { Colors } from '@/constants/Colors';
import { clearCart, removeFromCart, useCartItems } from '@/services/cart';
import { createOrder } from '@/services/orders';

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

  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const handleConfirmCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const firstItem = items[0];
      const restaurantName = firstItem.restaurantName || 'La Parrilla de la UdeA';
      
      const orderItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        ingredients: item.ingredients || [],
        extras: item.extras || [],
      }));

      const createdOrder = await createOrder({
        restaurantName,
        items: orderItems,
        total,
      });

      if (createdOrder) {
        setCreatedOrderId(createdOrder.id);
        clearCart();
        setIsConfirmOpen(false);
        setIsSuccessOpen(true);
      } else {
        Alert.alert('Error', 'No se pudo realizar el pedido. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error in handleConfirmCheckout:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado al procesar tu compra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />

      <View style={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
          <ThemedText style={[styles.backText, { color: colors.primary }]}>Volver al menú</ThemedText>
        </Pressable>
        <View style={styles.titleRow}>
          <ThemedText style={[styles.title, { color: colors.text }]}>Carrito</ThemedText>
          <ThemedText style={{ color: colors.textSecondary }}>{items.length} productos</ThemedText>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={48} color={colors.textSecondary} />
            <ThemedText style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 12 }}>
              Aún no has agregado productos.
            </ThemedText>
            <Pressable
              style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
              onPress={() => router.replace('/(tabs)')}
            >
              <ThemedText style={styles.emptyStateButtonText}>Explorar restaurantes</ThemedText>
            </Pressable>
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
          disabled={items.length === 0}
          style={[
            styles.checkoutButton, 
            { backgroundColor: items.length === 0 ? colors.border : colors.primary }
          ]}
          onPress={() => setIsConfirmOpen(true)}
        >
          <ThemedText style={styles.checkoutText}>Confirmar compra</ThemedText>
        </Pressable>
      </View>

      {items.length > 0 ? (
        <Pressable style={styles.clearButton} onPress={clearCart}>
          <ThemedText style={{ color: colors.error, fontWeight: '700' }}>Vaciar carrito</ThemedText>
        </Pressable>
      ) : null}

      {/* Modal de Confirmación de Compra (Contra entrega) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isConfirmOpen}
        onRequestClose={() => {
          if (!loading) setIsConfirmOpen(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>Resumen del Pedido</Text>
            <Text style={[styles.dialogMessage, { color: colors.textSecondary }]}>
              Tu pedido se realizará bajo la modalidad de pago contra entrega.
            </Text>

            <View style={[styles.summaryCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.summaryItemRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Restaurante:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={1}>
                  {items[0]?.restaurantName || 'UdeEat'}
                </Text>
              </View>

              <View style={styles.summaryItemRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Método de Pago:</Text>
                <Text style={[styles.summaryValue, { color: colors.primary, fontWeight: '800' }]}>
                  Efectivo al Recoger
                </Text>
              </View>

              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

              <View style={styles.summaryItemRow}>
                <Text style={[styles.summaryTotalLabel, { color: colors.text }]}>Total a pagar:</Text>
                <Text style={[styles.summaryTotalValue, { color: colors.primary }]}>
                  {formatCop(total)}
                </Text>
              </View>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 16 }} />
            ) : (
              <View style={{ width: '100%', gap: 10 }}>
                <TouchableOpacity
                  style={[styles.dialogButtonPrimary, { backgroundColor: colors.primary }]}
                  activeOpacity={0.88}
                  onPress={handleConfirmCheckout}
                >
                  <Text style={styles.dialogButtonTextPrimary}>Confirmar Pedido</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dialogButtonSecondary, { borderColor: colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => setIsConfirmOpen(false)}
                >
                  <Text style={[styles.dialogButtonTextSecondary, { color: colors.textSecondary }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Éxito */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isSuccessOpen}
        onRequestClose={() => setIsSuccessOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalIconContainer, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark" size={36} color="#fff" />
            </View>

            <Text style={[styles.dialogTitle, { color: colors.text }]}>¡Pedido Realizado!</Text>
            <Text style={[styles.dialogMessage, { color: colors.textSecondary, marginBottom: 16 }]}>
              Hemos registrado tu pedido exitosamente. Recuerda pagar en efectivo al momento de recogerlo en el restaurante.
            </Text>

            <View style={[styles.successDetailsCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center' }}>
                Tu orden ha sido guardada en la sección de "Pedidos".
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.dialogButtonPrimary, { backgroundColor: colors.primary, marginTop: 14 }]}
              activeOpacity={0.88}
              onPress={() => {
                setIsSuccessOpen(false);
                if (createdOrderId) {
                  router.push(`/orders/${createdOrderId}`);
                } else {
                  router.push('/(tabs)/ordenes');
                }
              }}
            >
              <Text style={styles.dialogButtonTextPrimary}>Ver mi pedido</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dialogButtonSecondary, { borderColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => {
                setIsSuccessOpen(false);
                router.replace('/(tabs)');
              }}
            >
              <Text style={[styles.dialogButtonTextSecondary, { color: colors.primary }]}>
                Ir al Inicio
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogBox: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '60%',
  },
  summaryDivider: {
    height: 1,
    width: '100%',
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  dialogButtonPrimary: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  dialogButtonSecondary: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successDetailsCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyStateButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
