import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardName: string;
  createdAt: string;
  updatedAt: string;
};

export async function createUserProfile(userId: string, data: Partial<UserProfile>) {
  const userRef = doc(db, "users", userId);
  const timestamp = new Date().toISOString();
  
  const profileData: UserProfile = {
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    email: data.email || "",
    phone: data.phone || "",
    addressLine1: data.addressLine1 || "",
    addressLine2: data.addressLine2 || "",
    city: data.city || "",
    state: data.state || "",
    zipCode: data.zipCode || "",
    cardNumber: data.cardNumber || "",
    cardExpiry: data.cardExpiry || "",
    cardCvv: data.cardCvv || "",
    cardName: data.cardName || "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await setDoc(userRef, profileData);
  return profileData;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
  const userRef = doc(db, "users", userId);
  const updatedData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(userRef, updatedData);
  return updatedData;
}
