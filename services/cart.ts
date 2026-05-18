import { useSyncExternalStore } from 'react';

export type CartItem = {
  id: string;
  name: string;
  restaurantName?: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  sizeLabel?: string;
  extras?: string[];
  ingredients?: string[];
};

let cartItems: CartItem[] = [];
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return cartItems;
}

function getCartItemKey(item: Pick<CartItem, 'id' | 'sizeLabel'>) {
  return `${item.id}::${item.sizeLabel ?? 'default'}`;
}

export function useCartItems() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getCartCount() {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0);
}

export function addToCart(item: CartItem) {
  const itemKey = getCartItemKey(item);
  const existingIndex = cartItems.findIndex((current) => getCartItemKey(current) === itemKey);

  if (existingIndex >= 0) {
    cartItems = cartItems.map((current, index) =>
      index === existingIndex ? { ...current, quantity: current.quantity + item.quantity } : current,
    );
  } else {
    cartItems = [...cartItems, item];
  }

  emitChange();
}

export function removeFromCart(itemId: string, sizeLabel?: string) {
  const keyToRemove = getCartItemKey({ id: itemId, sizeLabel });
  cartItems = cartItems.filter((item) => getCartItemKey(item) !== keyToRemove);
  emitChange();
}

export function updateCartQuantity(itemId: string, quantity: number, sizeLabel?: string) {
  if (quantity <= 0) {
    removeFromCart(itemId, sizeLabel);
    return;
  }

  const keyToUpdate = getCartItemKey({ id: itemId, sizeLabel });
  cartItems = cartItems.map((item) => (getCartItemKey(item) === keyToUpdate ? { ...item, quantity } : item));
  emitChange();
}

export function clearCart() {
  cartItems = [];
  emitChange();
}
