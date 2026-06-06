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
};

const API_BASE_URL = 'https://nq99z2pp-8080.use.devtunnels.ms/api/v1';

export async function getOrders(): Promise<Order[]> {
  // prepare for DB replacement: keep async signature
  return [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  return null;
}
