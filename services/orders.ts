import { Promise } from 'es6-promise';

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

const mockOrders: Order[] = [
  {
    id: 'ord-1001',
    number: 5,
    status: 'preparing',
    placedAt: '2025-06-27T08:15:00.000Z',
    restaurantName: 'Comedor Central UdeA',
    items: [
      {
        id: 'f-1',
        name: 'Huevo a la Mexicana',
        image: '/assets/images/huevo_mex.jpg',
        category: 'Desayuno',
        quantity: 2,
        unitPrice: 35000,
        calories: 420,
        ingredients: ['Frijoles', 'Cebolla', 'Chile', 'Jitomate', 'Huevo'],
        extras: ['Tortilla'],
      },
    ],
    total: 70000,
  },
  {
    id: 'ord-1002',
    number: 2,
    status: 'delivered',
    placedAt: '2025-06-20T12:10:00.000Z',
    restaurantName: 'Cafetería Norte',
    items: [
      {
        id: 'f-2',
        name: 'Sandwich de Pollo',
        image: '/assets/images/sandwich_pollo.jpg',
        category: 'Almuerzo',
        quantity: 3,
        unitPrice: 35000,
        calories: 560,
        ingredients: ['Pollo', 'Pan', 'Lechuga', 'Mayonesa'],
        extras: [],
      },
    ],
    total: 105000,
  },
];

export async function getOrders(): Promise<Order[]> {
  // prepare for DB replacement: keep async signature
  return Promise.resolve(mockOrders);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const found = mockOrders.find((o) => o.id === id || o.number.toString() === id);
  return Promise.resolve(found ?? null);
}
