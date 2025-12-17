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

export async function createOrder(order: OrderRecord): Promise<string> {
  const docRef = await addDoc(collection(db, "orders"), {
    ...order,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
