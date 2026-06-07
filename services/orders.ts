import * as SecureStore from 'expo-secure-store';

export type OrderStatus = 'draft' | 'placed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type OrderItem = {
  id: string;
  name: string;
  image?: string;
  category?: string;
  quantity: number;
  unitPrice: number; // in COP
  calories?: number;
  ingredients?: string[];
  extras?: string[];
  sizeLabel?: string;
};

export type Order = {
  id: string;
  number: number;
  status: OrderStatus;
  placedAt: string; // ISO date
  restaurantName: string;
  restaurantId?: string;
  items: OrderItem[];
  total: number; // in COP
  paymentMethod: string; // 'cash_on_pickup' for pay on delivery
  userId?: string; // Clerk user identifier for isolation
};

const API_BASE_URL = 'https://nq99z2pp-8080.use.devtunnels.ms/api/v1';
const STORAGE_KEY = 'udeeat.orders';

let cachedOrders: Order[] = [];
let hydrated = false;

async function loadFromStorage(): Promise<Order[]> {
  if (hydrated) {
    return cachedOrders;
  }
  try {
    // Limpiamos el almacenamiento local de pruebas anteriores
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  } catch { }
  cachedOrders = [];
  hydrated = true;
  return cachedOrders;
}

async function persistOrders(orders: Order[]): Promise<void> {
  cachedOrders = orders;
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Ignore storage issues on unsupported environments
  }
}

function mapBackendOrderToFrontend(bo: any): Order {
  return {
    id: bo.id || bo._id || '',
    number: bo.number || 0,
    status: bo.status || 'placed',
    placedAt: bo.placed_at || bo.placedAt || new Date().toISOString(),
    restaurantName: bo.restaurant_name || bo.restaurantName || 'UdeEat',
    restaurantId: bo.id_restaurant || bo.restaurantId || '',
    total: bo.total_cop || bo.total || 0,
    paymentMethod: bo.payment_method || bo.paymentMethod || 'cash_on_pickup',
    userId: bo.id_user || bo.userId || '',
    items: Array.isArray(bo.items)
      ? bo.items.map((item: any) => ({
        id: item.id_dish || item.id || '',
        name: item.dish_name || item.name || '',
        image: item.image || '',
        quantity: item.quantity || 1,
        unitPrice: item.unit_price_cop || item.unitPrice || 0,
        ingredients: item.extras || item.ingredients || [],
        extras: [],
        sizeLabel: item.label_size || item.sizeLabel || 'Regular',
      }))
      : [],
  };
}

export async function getOrders(token?: string | null): Promise<Order[]> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/orders`, { headers });
    if (response.ok) {
      const data = await response.json();
      const backendOrders = Array.isArray(data) ? data : [];
      console.log('📦 Órdenes recibidas del backend:', backendOrders);
      const mappedOrders = backendOrders.map(mapBackendOrderToFrontend);
      await persistOrders(mappedOrders);
      return mappedOrders;
    }
  } catch (error) {
    console.warn('[getOrders] Error connecting to backend, loading from local fallback:', error);
  }
  const localData = await loadFromStorage();
  console.log('📦 Órdenes cargadas de almacenamiento local (fallback):', localData);
  return localData;
}

export async function getOrderById(id: string, token?: string | null): Promise<Order | null> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, { headers });
    if (response.ok) {
      const data = await response.json();
      console.log(`🍔 Detalle de orden ${id} recibido del backend:`, data);
      return mapBackendOrderToFrontend(data);
    }
  } catch (error) {
    console.warn(`[getOrderById] Error getting order ${id} from backend, searching local fallback:`, error);
  }

  const localOrders = await loadFromStorage();
  const foundLocal = localOrders.find(o => o.id === id) || null;
  console.log(`🍔 Detalle de orden ${id} cargado del almacenamiento local (fallback):`, foundLocal);
  return foundLocal;
}

export async function createOrder(
  orderData: Omit<Order, 'id' | 'number' | 'status' | 'placedAt' | 'paymentMethod'>,
  token?: string | null
): Promise<Order | null> {
  const finalRestaurantId = orderData.restaurantId || 'parrilla-udea';

  const localOrder: Order = {
    id: 'ord_' + Math.random().toString(36).substring(2, 11),
    number: Math.floor(1000 + Math.random() * 9000),
    status: 'placed',
    placedAt: new Date().toISOString(),
    restaurantName: orderData.restaurantName,
    restaurantId: finalRestaurantId,
    items: orderData.items,
    total: orderData.total,
    paymentMethod: 'cash_on_pickup', // Pago contra entrega
  };

  const requestPayload = {
    id_user: orderData.userId || '',
    id_restaurant: finalRestaurantId,
    items: orderData.items.map((item) => ({
      id_dish: item.id,
      label_size: item.sizeLabel || 'Regular',
      quantity: item.quantity,
      extras: item.ingredients || item.extras || [],
    })),
  };

  console.log('🌐 [createOrder] Enviando petición POST /orders con payload:', JSON.stringify(requestPayload, null, 2));

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 [createOrder] Token JWT de Clerk para usar en Postman:\n', token, '\n');
    }

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestPayload),
    });

    console.log(`🌐 [createOrder] Respuesta del servidor - Status: ${response.status} ${response.statusText}`);
    const responseText = await response.text();
    console.log(`🌐 [createOrder] Respuesta del servidor - Body:`, responseText);

    if (response.ok) {
      let createdOrder: Order;
      try {
        const parsed = JSON.parse(responseText);
        createdOrder = mapBackendOrderToFrontend(parsed);
      } catch {
        createdOrder = localOrder;
      }
      console.log('🚀 Orden creada exitosamente en el backend:', createdOrder);
      const current = await loadFromStorage();
      await persistOrders([createdOrder, ...current]);
      return createdOrder;
    } else {
      console.warn(`[createOrder] El servidor respondió con un código de error: ${response.status}`);
    }
  } catch (error) {
    console.error('[createOrder] Error de red o conexión al intentar crear la orden:', error);
  }

  console.log('🚀 Usando fallback: Orden guardada localmente:', localOrder);
  const current = await loadFromStorage();
  const nextOrders = [localOrder, ...current];
  await persistOrders(nextOrders);
  return localOrder;
}
