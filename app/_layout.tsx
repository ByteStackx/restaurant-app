import { Stack } from "expo-router";
import { AuthProvider } from "./lib/auth-context";
import { CartProvider } from "./lib/cart-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
      <Stack
        screenOptions={{
          headerTitleAlign: "center",
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ title: "Welcome" }} />
        <Stack.Screen name="home" options={{ title: "Home" }} />
        <Stack.Screen name="menu" options={{ title: "Menu" }} />
        <Stack.Screen name="menu-item" options={{ title: "Item Details" }} />
        <Stack.Screen name="cart" options={{ title: "Cart" }} />
        <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
        <Stack.Screen name="account" options={{ title: "Account" }} />
        <Stack.Screen name="login" options={{ title: "Log In" }} />
        <Stack.Screen name="register" options={{ title: "Create Account" }} />
      </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
