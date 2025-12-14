import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export type RestaurantInfo = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  hours: string;
  updatedAt?: string;
};

export async function getRestaurantInfo(): Promise<RestaurantInfo | null> {
  const ref = doc(db, "admin", "restaurant");
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as RestaurantInfo;
}

export async function saveRestaurantInfo(data: RestaurantInfo): Promise<void> {
  const ref = doc(db, "admin", "restaurant");
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export type MenuItem = {
  id?: string;
  name: string;
  price: number;
  description: string;
  longDescription?: string;
  imageUrl?: string;
  foodType?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  allergens?: string[];
  sides?: string[];
  drinks?: string[];
  extras?: string[];
  customIngredients?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export async function listMenuItems(): Promise<MenuItem[]> {
  const snap = await getDocs(collection(db, "menuItems"));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as MenuItem) }));
}

export async function getMenuItem(id: string): Promise<MenuItem | null> {
  const ref = doc(db, "menuItems", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as MenuItem) };
}

export async function createMenuItem(data: MenuItem): Promise<string> {
  const payload = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  const docRef = await addDoc(collection(db, "menuItems"), payload);
  return docRef.id;
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>): Promise<void> {
  const ref = doc(db, "menuItems", id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteMenuItem(id: string): Promise<void> {
  const ref = doc(db, "menuItems", id);
  await deleteDoc(ref);
}
