import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type FoodCategory = "starters" | "salads" | "mains" | "sides" | "desserts" | "drinks";

type FoodTypeSliderProps = {
  activeCategory?: FoodCategory;
  onCategoryChange?: (category: FoodCategory) => void;
};

const CATEGORIES: { id: FoodCategory; label: string }[] = [
  { id: "starters", label: "Starters" },
  { id: "salads", label: "Salads" },
  { id: "mains", label: "Mains" },
  { id: "sides", label: "Sides" },
  { id: "desserts", label: "Desserts" },
  { id: "drinks", label: "Drinks" },
];

export function FoodTypeSlider({
  activeCategory = "mains",
  onCategoryChange,
}: FoodTypeSliderProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => {
          const isActive = category.id === activeCategory;
          return (
            <Pressable
              key={category.id}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
              onPress={() => onCategoryChange?.(category.id)}
            >
              <Text
                style={[
                  styles.label,
                  isActive ? styles.activeLabel : styles.inactiveLabel,
                ]}
              >
                {category.label}
              </Text>
              {isActive && <View style={styles.underline} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingVertical: 8,
    gap: 24,
    alignItems: "center",
  },
  tab: {
    paddingVertical: 4,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  activeLabel: {
    color: "#111827",
  },
  inactiveLabel: {
    color: "#9CA3AF",
  },
  underline: {
    height: 2,
    backgroundColor: "#111827",
    marginTop: 4,
    width: "100%",
  },
});
