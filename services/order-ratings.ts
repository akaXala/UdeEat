import * as SecureStore from 'expo-secure-store';

export type ItemRatingMap = Record<string, number>;

export type OrderRating = {
  orderId: string;
  restaurantRating: number;
  itemRatings: ItemRatingMap;
  ratedAt: string;
};

export type OrderRatingMap = Record<string, OrderRating>;

const STORAGE_KEY = 'udeeat.order-ratings';

let cachedRatings: OrderRatingMap = {};
let hydrated = false;
let loadingPromise: Promise<OrderRatingMap> | null = null;

async function loadFromStorage() {
  if (hydrated) {
    return cachedRatings;
  }

  if (!loadingPromise) {
    loadingPromise = (async () => {
      try {
        const raw = await SecureStore.getItemAsync(STORAGE_KEY);
        if (raw) {
          cachedRatings = JSON.parse(raw) as OrderRatingMap;
        }
      } catch {
        cachedRatings = {};
      }

      hydrated = true;
      return cachedRatings;
    })();
  }

  return loadingPromise;
}

async function persistRatings() {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(cachedRatings));
  } catch {
    // Ignore persistence errors on unsupported devices.
  }
}

export async function getOrderRatings() {
  return loadFromStorage();
}

export async function getOrderRating(orderId: string): Promise<OrderRating | null> {
  const ratings = await loadFromStorage();
  return ratings[orderId] ?? null;
}

export async function saveOrderRating(rating: Omit<OrderRating, 'ratedAt'>) {
  const ratings = await loadFromStorage();

  if (ratings[rating.orderId]) {
    return null;
  }

  const nextRating: OrderRating = {
    ...rating,
    ratedAt: new Date().toISOString(),
  };

  cachedRatings = { ...ratings, [rating.orderId]: nextRating };
  await persistRatings();
  return nextRating;
}

export function hasOrderRating(orderId: string) {
  return Boolean(cachedRatings[orderId]);
}

export function findPendingDeliveredOrder<T extends { id: string; status: string }>(
  orders: T[],
  ratings: OrderRatingMap,
) {
  return orders.find((order) => order.status === 'delivered' && !ratings[order.id]) ?? null;
}
