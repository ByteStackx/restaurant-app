import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { BottomTabs } from "./components/BottomTabs";
import { FoodTypeSlider } from "./components/FoodTypeSlider";
import { MenuItemCard, MenuItemCardProps } from "./components/MenuItemCard";
import { TopNav } from "./components/TopNav";
import { useCart } from "./lib/cart-context";
import { listMenuItems, MenuItem } from "./services/firebase/admin-service";

type FoodCategory = "starters" | "salads" | "mains" | "sides" | "desserts" | "drinks";

const CATEGORY_ORDER: FoodCategory[] = ["starters", "salads", "mains", "sides", "desserts", "drinks"];

const CATEGORY_TITLES: Record<FoodCategory, string> = {
  starters: "Starters",
  salads: "Salads",
  mains: "Mains",
  sides: "Sides",
  desserts: "Desserts",
  drinks: "Drinks",
};

const createEmptyMenuData = (): Record<
  FoodCategory,
  { items: MenuItemCardProps[]; title: string }
> => ({
  starters: { title: CATEGORY_TITLES.starters, items: [] },
  salads: { title: CATEGORY_TITLES.salads, items: [] },
  mains: { title: CATEGORY_TITLES.mains, items: [] },
  sides: { title: CATEGORY_TITLES.sides, items: [] },
  desserts: { title: CATEGORY_TITLES.desserts, items: [] },
  drinks: { title: CATEGORY_TITLES.drinks, items: [] },
});

const organizeMenuItemsByCategory = (
  items: MenuItem[]
): Record<FoodCategory, { items: MenuItemCardProps[]; title: string }> => {
  const organized = createEmptyMenuData();

  items.forEach((item) => {
    const category = item.foodType as FoodCategory;
    if (category && organized[category] && item.id) {
      // Check if item has mandatory options (sides array with content)
      const hasMandatoryOptions = Boolean(item.sides && item.sides.length > 0);
      
      organized[category].items.push({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        hasMandatoryOptions,
      });
    }
  });

  return organized;
};

export default function Menu() {
  const router = useRouter();
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState<FoodCategory>("starters");
  const [menuData, setMenuData] = useState<Record<FoodCategory, { items: MenuItemCardProps[]; title: string }>>(
    createEmptyMenuData()
  );
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRefs = useRef<Record<FoodCategory, number>>({
    starters: 0,
    salads: 0,
    mains: 0,
    sides: 0,
    desserts: 0,
    drinks: 0,
  });
  const scrollViewRef = useRef<ScrollView>(null);
  const isScrollingToSection = useRef(false);

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setLoading(true);
        const items = await listMenuItems();
        setAllMenuItems(items);
        const organized = organizeMenuItemsByCategory(items);
        setMenuData(organized);
        setError(null);
      } catch (err) {
        console.error("Error loading menu items:", err);
        setError("Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };

    loadMenuItems();
  }, []);

  const handleAddToCart = (itemId: string) => {
    const item = allMenuItems.find((i) => i.id === itemId);
    if (!item) return;

    // Add item with default quantity and no customizations
    addItem({
      id: item.id!,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl,
    });
  };

  const handleItemPress = (itemId: string) => {
    router.push({ pathname: "/menu-item", params: { id: itemId } });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrollingToSection.current) return;

    const scrollY = event.nativeEvent.contentOffset.y;
    let currentCategory = activeCategory;

    for (const category of CATEGORY_ORDER) {
      const sectionY = sectionRefs.current[category];
      if (sectionY !== undefined && scrollY >= sectionY - 100) {
        currentCategory = category;
      }
    }

    if (currentCategory !== activeCategory) {
      setActiveCategory(currentCategory);
    }
  };

  const handleCategoryPress = (category: FoodCategory) => {
    const sectionY = sectionRefs.current[category];
    if (sectionY !== undefined && scrollViewRef.current) {
      isScrollingToSection.current = true;
      setActiveCategory(category);
      scrollViewRef.current.scrollTo({ y: sectionY - 10, animated: true });
      
      setTimeout(() => {
        isScrollingToSection.current = false;
      }, 500);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.page}>
          <TopNav />
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#DC2626" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <TopNav />
        <FoodTypeSlider
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryPress}
        />
        <ScrollView
          ref={scrollViewRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {CATEGORY_ORDER.map((category) => {
            const { title, items } = menuData[category];
            return (
              <View
                key={category}
                style={styles.section}
                onLayout={(event) => {
                  sectionRefs.current[category] = event.nativeEvent.layout.y;
                }}
              >
                <Text style={styles.sectionHeader}>{title}</Text>
                {items.length === 0 ? (
                  <Text style={styles.emptyText}>No items available</Text>
                ) : (
                  items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      {...item}
                      onAddToCart={handleAddToCart}
                      onPress={handleItemPress}
                    />
                  ))
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
      <BottomTabs activeKey="menu" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  page: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 140,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginHorizontal: 20,
    marginBottom: 12,
    fontStyle: "italic",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },
  errorText: {
    color: "#991B1B",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    fontStyle: "italic",
    marginHorizontal: 20,
    marginBottom: 12,
  },
});
