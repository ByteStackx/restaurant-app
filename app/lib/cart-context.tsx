import React, { createContext, useContext, useMemo, useState } from "react";

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

  const clear = () => setItems([]);

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
