import * as SecureStore from 'expo-secure-store';

export type OrderStatus = 'waiting' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

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
};

export type Order = {
  id: string;
  number: number;
  status: OrderStatus;
  placedAt: string; // ISO date
  restaurantName: string;
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
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (raw) {
      cachedOrders = JSON.parse(raw) as Order[];
    }
  } catch {
    cachedOrders = [];
  }
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

export async function getOrders(): Promise<Order[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (response.ok) {
      const data = await response.json();
      const backendOrders = Array.isArray(data) ? data : [];
      await persistOrders(backendOrders);
      return backendOrders;
    }
  } catch (error) {
    console.warn('[getOrders] Error connecting to backend, loading from local fallback:', error);
  }
  return loadFromStorage();
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.warn(`[getOrderById] Error getting order ${id} from backend, searching local fallback:`, error);
  }
  
  const localOrders = await loadFromStorage();
  return localOrders.find(o => o.id === id) || null;
}

export async function createOrder(orderData: Omit<Order, 'id' | 'number' | 'status' | 'placedAt' | 'paymentMethod'>): Promise<Order | null> {
  const localOrder: Order = {
    id: 'ord_' + Math.random().toString(36).substring(2, 11),
    number: Math.floor(1000 + Math.random() * 9000),
    status: 'waiting',
    placedAt: new Date().toISOString(),
    restaurantName: orderData.restaurantName,
    items: orderData.items,
    total: orderData.total,
    paymentMethod: 'cash_on_pickup', // Pago contra entrega
  };

  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(localOrder),
    });

    if (response.ok) {
      const createdOrder = await response.json();
      const current = await loadFromStorage();
      await persistOrders([createdOrder, ...current]);
      return createdOrder;
    }
  } catch (error) {
    console.warn('[createOrder] Error creating order in backend, saving to local fallback:', error);
  }

  const current = await loadFromStorage();
  const nextOrders = [localOrder, ...current];
  await persistOrders(nextOrders);
  return localOrder;
}
