import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type AdminTabKey = "restaurant" | "food" | "orders";

const TABS: { key: AdminTabKey; label: string; href: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "restaurant", label: "Restaurant", href: "/admin/restaurant", icon: "business-outline" },
  { key: "food", label: "Food", href: "/admin/food", icon: "fast-food-outline" },
  { key: "orders", label: "Orders", href: "/admin/orders", icon: "receipt-outline" },
];

export function AdminTabs({ active }: { active: AdminTabKey }) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const color = isActive ? "#111827" : "#6B7280";
        return (
          <Pressable
            key={tab.key}
            style={({ pressed }) => [styles.tab, isActive && styles.activeTab, pressed && styles.pressed]}
            onPress={() => router.replace(tab.href as Href)}
          >
            <Ionicons name={tab.icon} size={20} color={color} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#F3F4F6",
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
