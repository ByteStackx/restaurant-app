import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type TabKey = "home" | "menu" | "cart" | "account" | "more";

type BottomTabsProps = {
  activeKey?: TabKey;
};

const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "home", label: "Home", icon: "home" },
  { key: "menu", label: "Menu", icon: "fast-food-outline" },
  { key: "cart", label: "Cart", icon: "cart-outline" },
  { key: "account", label: "Account", icon: "person-outline" },
  { key: "more", label: "More", icon: "ellipsis-horizontal" },
];

const ROUTES: Partial<Record<TabKey, string>> = {
  home: "/home",
  menu: "/menu",
  cart: "/cart",
  account: "/account",
};

export function BottomTabs({ activeKey = "home" }: BottomTabsProps) {
  const router = useRouter();

  const handlePress = (key: TabKey) => {
    const href = ROUTES[key];
    if (href) {
      router.push(href as Href);
    } else {
      console.log("Tab pressed", key);
    }
  };

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = tab.key === activeKey;
        const color = isActive ? "#111827" : "#6B7280";
        return (
          <Pressable
            key={tab.key}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.activeTab,
              pressed && styles.pressed,
            ]}
            onPress={() => handlePress(tab.key)}
          >
            <Ionicons name={tab.icon} size={22} color={color} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
