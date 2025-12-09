declare module "firebase/auth/react-native" {
  import AsyncStorage from "@react-native-async-storage/async-storage";
    import { initializeAuth, Persistence } from "firebase/auth";

  export function getReactNativePersistence(storage: typeof AsyncStorage): Persistence;
  export { initializeAuth };
}
