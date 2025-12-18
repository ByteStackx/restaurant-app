import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from "firebase/firestore";
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

export type OrderDoc = OrderRecord & { id: string; createdAt?: Date | null };

function cleanUndefined(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (Array.isArray(value)) {
    const cleaned = value
      .map((v) => cleanUndefined(v))
      .filter((v) => v !== undefined);
    return cleaned;
  }
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
      const cleaned = cleanUndefined(v);
      if (cleaned !== undefined) {
        result[k] = cleaned;
      }
    });
    return result;
  }
  return value;
}

export async function createOrder(order: OrderRecord): Promise<string> {
  const cleanOrder = cleanUndefined(order) as Record<string, unknown>;

  const docRef = await addDoc(collection(db, "orders"), {
    ...cleanOrder,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function listOrdersByUser(userId: string): Promise<OrderDoc[]> {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => {
    const data = docSnap.data() as OrderRecord & { createdAt?: { toDate?: () => Date } };
    const createdAt = data.createdAt && typeof data.createdAt === "object" && typeof (data.createdAt as any).toDate === "function"
      ? (data.createdAt as any).toDate()
      : null;
    return {
      id: docSnap.id,
      ...data,
      createdAt,
    };
  });
}
