import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_STORAGE_KEY = "@restaurant_cart";

export type CartItem = {
  id: string;
  name: string;
  price: number; // base item price
  quantity: number;
  imageUrl?: string;
  // selections
  sides?: string[];
  drink?: string; // id of selected drink option
  extras?: string[]; // ids of selected extras
  ingredients?: string[]; // custom ingredient selections
  // computed add-ons (optional)
  addOnTotal?: number;
};

export type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, index?: number) => void;
  updateItemQuantity: (id: string, quantity: number, index?: number) => void;
  updateItemAtIndex: (index: number, updates: Partial<CartItem>) => void;
  clear: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore cart from AsyncStorage on mount
  useEffect(() => {
    const restoreCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error("Failed to restore cart:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    restoreCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch((error) =>
        console.error("Failed to save cart:", error)
      );
    }
  }, [items, isLoaded]);

  const addItem = (item: CartItem) => {
    setItems((prev) => [...prev, item]);
  };

  const removeItem = (id: string, index?: number) => {
    setItems((prev) => {
      if (index !== undefined) {
        const next = [...prev];
        const idx = index >= 0 && index < next.length ? index : next.findIndex((i) => i.id === id);
        if (idx >= 0) next.splice(idx, 1);
        return next;
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const clear = () => {
    setItems([]);
    AsyncStorage.removeItem(CART_STORAGE_KEY).catch((error) =>
      console.error("Failed to clear cart storage:", error)
    );
  };

  const updateItemQuantity = (id: string, quantity: number, index?: number) => {
    setItems((prev) => {
      const next = [...prev];
      const idx = index !== undefined ? index : next.findIndex((i) => i.id === id);
      if (idx >= 0) {
        const updated = { ...next[idx], quantity };
        if (updated.quantity <= 0) {
          next.splice(idx, 1);
        } else {
          next[idx] = updated;
        }
      }
      return next;
    });
  };

  const updateItemAtIndex = (index: number, updates: Partial<CartItem>) => {
    setItems((prev) => {
      const next = [...prev];
      if (index >= 0 && index < next.length) {
        next[index] = { ...next[index], ...updates };
      }
      return next;
    });
  };

  const count = items.length;
  const total = useMemo(() => items.reduce((sum, i) => sum + (i.price + (i.addOnTotal || 0)) * i.quantity, 0), [items]);

  const value: CartContextValue = { items, addItem, removeItem, updateItemQuantity, updateItemAtIndex, clear, count, total };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
