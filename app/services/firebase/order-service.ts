import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export type OrderItemSelections = {
  sides?: string[];
  drink?: string;
  extras?: string[];
  ingredients?: string[];
};

export type OrderItem = {
  itemId: string;
  name: string;
  quantity: number;
  basePrice: number;
  addOnTotal: number;
  lineTotal: number;
  selections: OrderItemSelections;
  imageUrl?: string;
};

export type OrderTotals = {
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  currency: string;
};

export type OrderPayment = {
  provider: "stripe";
  status: string;
  intentId?: string;
  amount: number;
  currency: string;
  last4?: string;
  methodType?: string;
};

export type OrderRecord = {
  userId?: string | null;
  status: "pending" | "paid" | "failed";
  address: string;
  items: OrderItem[];
  totals: OrderTotals;
  payment: OrderPayment;
  contactName?: string;
  contactPhone?: string;
  note?: string;
  createdAt?: unknown;
};

function cleanUndefined(obj: unknown): unknown {
  if (obj === null || obj === undefined) return undefined;
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined).filter((v) => v !== undefined);
  }
  if (typeof obj === "object") {
    const cleaned: Record<string, unknown> = {};
    Object.entries(obj).forEach(([key, value]) => {
      const cleanedValue = cleanUndefined(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    });
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }
  return obj;
}

export async function createOrder(order: OrderRecord): Promise<string> {
  // Recursively filter out undefined values - Firestore doesn't allow them
  const cleanedOrder = cleanUndefined(order) as Record<string, unknown>;

  const docRef = await addDoc(collection(db, "orders"), {
    ...cleanedOrder,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
