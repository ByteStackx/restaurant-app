import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { BottomTabs } from "./components/BottomTabs";
import { FoodTypeSlider } from "./components/FoodTypeSlider";
import { MenuItemCard, MenuItemCardProps } from "./components/MenuItemCard";
import { TopNav } from "./components/TopNav";

type FoodCategory = "starters" | "salads" | "mains" | "sides" | "desserts" | "drinks";

const CATEGORY_ORDER: FoodCategory[] = ["starters", "salads", "mains", "sides", "desserts", "drinks"];

const MENU_DATA: Record<FoodCategory, { items: MenuItemCardProps[]; title: string }> = {
  starters: {
    title: "Starters",
    items: [
      {
        id: "1",
        name: "Crispy Spring Rolls",
        description: "Golden fried rolls with fresh herbs and sweet chili sauce.",
        price: 8.99,
      },
      {
        id: "2",
        name: "Garlic Bread",
        description: "Toasted with butter and fresh parmesan.",
        price: 6.99,
      },
    ],
  },
  salads: {
    title: "Salads",
    items: [
      {
        id: "3",
        name: "Caesar Salad",
        description: "Crisp romaine, parmesan, croutons, and creamy Caesar dressing.",
        price: 12.99,
      },
      {
        id: "4",
        name: "Caprese Salad",
        description: "Tomato, mozzarella, basil, and balsamic glaze.",
        price: 11.99,
      },
    ],
  },
  mains: {
    title: "Mains",
    items: [
      {
        id: "5",
        name: "Grilled Salmon",
        description: "Fresh salmon fillet with lemon butter sauce and roasted vegetables.",
        price: 24.99,
      },
      {
        id: "6",
        name: "Ribeye Steak",
        description: "Prime cut steak with garlic mashed potatoes and asparagus.",
        price: 28.99,
      },
      {
        id: "7",
        name: "Pasta Carbonara",
        description: "Classic Italian pasta with pancetta, egg, and pecorino cheese.",
        price: 16.99,
      },
    ],
  },
  sides: {
    title: "Sides",
    items: [
      {
        id: "8",
        name: "Fries",
        description: "Crispy golden fries with sea salt.",
        price: 5.99,
      },
      {
        id: "9",
        name: "Roasted Vegetables",
        description: "Seasonal vegetables with olive oil and herbs.",
        price: 7.99,
      },
    ],
  },
  desserts: {
    title: "Desserts",
    items: [
      {
        id: "10",
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with molten center and vanilla ice cream.",
        price: 9.99,
      },
      {
        id: "11",
        name: "Tiramisu",
        description: "Classic Italian dessert with espresso and mascarpone.",
        price: 8.99,
      },
    ],
  },
  drinks: {
    title: "Drinks",
    items: [
      {
        id: "12",
        name: "Fresh Orange Juice",
        description: "Freshly squeezed orange juice.",
        price: 4.99,
      },
      {
        id: "13",
        name: "Iced Tea",
        description: "Refreshing iced tea with lemon.",
        price: 3.99,
      },
    ],
  },
};

export default function Menu() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<FoodCategory>("starters");
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

  const handleAddToCart = (itemId: string) => {
    console.log("Added to cart:", itemId);
  };

  const handleItemPress = (itemId: string) => {
    router.push({ pathname: "/menu-item", params: { id: itemId } });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrollingToSection.current) return;

    const scrollY = event.nativeEvent.contentOffset.y;
    let currentCategory = activeCategory;

    // Find which section is currently in view
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
          {CATEGORY_ORDER.map((category, index) => {
            const { title, items } = MENU_DATA[category];
            return (
              <View
                key={category}
                style={styles.section}
                onLayout={(event) => {
                  sectionRefs.current[category] = event.nativeEvent.layout.y;
                }}
              >
                <Text style={styles.sectionHeader}>{title}</Text>
                {items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    {...item}
                    onAddToCart={handleAddToCart}
                    onPress={handleItemPress}
                  />
                ))}
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
});
