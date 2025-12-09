import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../lib/auth-context";

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
  const { logout } = useAuth();
  const [showMore, setShowMore] = useState(false);

  const handlePress = (key: TabKey) => {
    const href = ROUTES[key];
    if (href) {
      router.push(href as Href);
    } else {
      console.log("Tab pressed", key);
    }
  };

  const handleMore = () => {
    setShowMore(true);
  };

  const handleLogout = () => {
    logout()
      .then(() => {
        setShowMore(false);
        router.push("/login" as Href);
      })
      .catch((err) => {
        setShowMore(false);
        console.log("Logout failed", err);
      });
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
            onPress={() => (tab.key === "more" ? handleMore() : handlePress(tab.key))}
          >
            <Ionicons name={tab.icon} size={22} color={color} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}

      <Modal
        transparent
        visible={showMore}
        animationType="fade"
        onRequestClose={() => setShowMore(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setShowMore(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>More</Text>
            <Pressable style={styles.sheetItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              <Text style={styles.sheetItemDanger}>Log out</Text>
            </Pressable>
            <Pressable style={styles.sheetItem} onPress={() => setShowMore(false)}>
              <Ionicons name="close" size={18} color="#111827" />
              <Text style={styles.sheetItemText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 10,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  sheetItemText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  sheetItemDanger: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
  },
});
