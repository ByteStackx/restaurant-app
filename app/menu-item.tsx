import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Accordion } from "./components/Accordion";
import { BottomTabs } from "./components/BottomTabs";
import { CheckboxGroup } from "./components/CheckboxGroup";
import { PrimaryButton } from "./components/PrimaryButton";
import { QuantitySelector } from "./components/QuantitySelector";
import { RadioGroup } from "./components/RadioGroup";
import { TopNav } from "./components/TopNav";
import { useCart } from "./lib/cart-context";
import { getMenuItem, MenuItem } from "./services/firebase/admin-service";

type OptionWithPrice = { id: string; label: string; price?: number };
type OptionWithDescription = { id: string; label: string; description?: string };

// Helper function to parse price from parentheses format: "Item Name(2.99)" -> { name: "Item Name", price: 2.99 }
const parseItemWithPrice = (item: string): { name: string; price: number } => {
  const match = item.match(/^(.+?)\(([0-9.]+)\)$/);
  if (match) {
    return {
      name: match[1].trim(),
      price: parseFloat(match[2]),
    };
  }
  return { name: item.trim(), price: 0 };
};

// Helper functions to convert string arrays to option formats
const createOptionsFromArray = (items: string[] | undefined): OptionWithPrice[] => {
  if (!items || items.length === 0) return [];
  return items.map((item, index) => {
    const { name, price } = parseItemWithPrice(item);
    return {
      id: `option-${index}`,
      label: name,
      price,
    };
  });
};

const createIngredientOptions = (items: string[] | undefined): OptionWithDescription[] => {
  if (!items || items.length === 0) return [];
  return items.map((item, index) => ({
    id: `ingredient-${index}`,
    label: item,
  }));
};

export default function MenuItemDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const itemId = params.id as string;
  const { addItem } = useCart();
  
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidesError, setSidesError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSides, setSelectedSides] = useState<string[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<string>("");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  useEffect(() => {
    const loadMenuItem = async () => {
      if (!itemId) {
        setError("No item ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const menuItem = await getMenuItem(itemId);
        if (menuItem) {
          setItem(menuItem);
          setError(null);
        } else {
          setError("Menu item not found");
        }
      } catch (err) {
        console.error("Error loading menu item:", err);
        setError("Failed to load menu item");
      } finally {
        setLoading(false);
      }
    };

    loadMenuItem();
  }, [itemId]);

  const calculateTotal = () => {
    if (!item) return 0;
    let total = item.price;

    // Add drink price if selected
    if (selectedDrink && item.drinks) {
      const drinkOptions = createOptionsFromArray(item.drinks);
      const selectedDrinkOption = drinkOptions.find((d) => d.id === selectedDrink);
      if (selectedDrinkOption && selectedDrinkOption.price) {
        total += selectedDrinkOption.price;
      }
    }

    // Add extras prices
    if (selectedExtras.length > 0 && item.extras) {
      const extraOptions = createOptionsFromArray(item.extras);
      selectedExtras.forEach((extraId) => {
        const extra = extraOptions.find((e) => e.id === extraId);
        if (extra && extra.price) {
          total += extra.price;
        }
      });
    }

    return total * quantity;
  };

  const handleAddToCart = () => {
    if (!item) return;

    // Check if sides are required and validate
    if (item.sides && item.sides.length > 0 && selectedSides.length === 0) {
      setSidesError("Please select at least one side to continue");
      return;
    }

    // Clear error if validation passes
    setSidesError(null);

    // compute add-on total based on selected drink/extras
    let addOnTotal = 0;
    // build option arrays once for label lookups
    const drinkOptions = item.drinks ? createOptionsFromArray(item.drinks) : [];
    const extraOptions = item.extras ? createOptionsFromArray(item.extras) : [];
    const sideOptions = item.sides ? createOptionsFromArray(item.sides) : [];
    const ingredientOptions = item.customIngredients ? createIngredientOptions(item.customIngredients) : [];
    if (selectedDrink && item.drinks) {
      const selectedDrinkOption = drinkOptions.find((d) => d.id === selectedDrink);
      if (selectedDrinkOption?.price) addOnTotal += selectedDrinkOption.price;
    }
    if (selectedExtras.length > 0 && item.extras) {
      selectedExtras.forEach((extraId) => {
        const extra = extraOptions.find((e) => e.id === extraId);
        if (extra?.price) addOnTotal += extra.price;
      });
    }

    addItem({
      id: item.id!,
      name: item.name,
      price: item.price,
      quantity,
      imageUrl: item.imageUrl,
      // store human-readable labels instead of internal option ids
      sides: selectedSides.map((sid) => sideOptions.find((s) => s.id === sid)?.label || sid),
      drink: selectedDrink ? (drinkOptions.find((d) => d.id === selectedDrink)?.label || selectedDrink) : undefined,
      extras: selectedExtras.map((eid) => extraOptions.find((e) => e.id === eid)?.label || eid),
      ingredients: selectedIngredients.map((iid) => ingredientOptions.find((i) => i.id === iid)?.label || iid),
      addOnTotal,
    });

    // Show success message
    setSuccessMessage(`${item.name} added to cart!`);
    
    // Navigate back to menu after a short delay
    setTimeout(() => {
      router.push("/menu");
    }, 1500);
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
        <BottomTabs activeKey="menu" />
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.page}>
          <TopNav />
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error || "Item not found"}</Text>
          </View>
        </View>
        <BottomTabs activeKey="menu" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <TopNav />
        {successMessage && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Item Image */}
          <View style={styles.imageContainer}>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={48} color="#D1D5DB" />
              </View>
            )}
          </View>

          {/* Item Details */}
          <View style={styles.detailsContainer}>
            {/* Price and Name */}
            <View style={styles.header}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>{item.description}</Text>
            {item.longDescription && (
              <Text style={styles.longDescription}>{item.longDescription}</Text>
            )}

            {/* Nutrition */}
            {(item.calories || item.protein || item.carbs || item.fat) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nutrition (per serving)</Text>
                <View style={styles.nutritionGrid}>
                  {item.calories !== undefined && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                      <Text style={styles.nutritionValue}>{item.calories}</Text>
                    </View>
                  )}
                  {item.protein !== undefined && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                      <Text style={styles.nutritionValue}>{item.protein}g</Text>
                    </View>
                  )}
                  {item.carbs !== undefined && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Carbs</Text>
                      <Text style={styles.nutritionValue}>{item.carbs}g</Text>
                    </View>
                  )}
                  {item.fat !== undefined && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Fat</Text>
                      <Text style={styles.nutritionValue}>{item.fat}g</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Allergens */}
            {item.allergens && item.allergens.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Allergens</Text>
                <View style={styles.allergenList}>
                  {item.allergens.map((allergen, index) => (
                    <View key={index} style={styles.allergenBadge}>
                      <Text style={styles.allergenText}>{allergen}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Customization Options */}
            <View style={styles.customizationSection}>
              {/* Sides */}
              {item.sides && item.sides.length > 0 && (
                <Accordion
                  title="Choose Your Sides"
                  icon="checkmark-circle-outline"
                  defaultOpen={false}
                >
                  <Text style={styles.accordionHelper}>Select up to 2 sides (included in price)</Text>
                  <CheckboxGroup
                    options={createOptionsFromArray(item.sides)}
                    selected={selectedSides}
                    onSelect={setSelectedSides}
                    maxSelections={2}
                  />
                  {sidesError && (
                    <Text style={styles.errorMessage}>{sidesError}</Text>
                  )}
                </Accordion>
              )}

              {/* Drinks */}
              {item.drinks && item.drinks.length > 0 && (
                <Accordion
                  title="Add a Drink"
                  icon="water-outline"
                  defaultOpen={false}
                >
                  <Text style={styles.accordionHelper}>Select one drink</Text>
                  <RadioGroup
                    options={createOptionsFromArray(item.drinks)}
                    selected={selectedDrink}
                    onSelect={setSelectedDrink}
                  />
                </Accordion>
              )}

              {/* Extras */}
              {item.extras && item.extras.length > 0 && (
                <Accordion
                  title="Add Extras"
                  icon="add-circle-outline"
                  defaultOpen={false}
                >
                  <Text style={styles.accordionHelper}>Add extra items</Text>
                  <CheckboxGroup
                    options={createOptionsFromArray(item.extras)}
                    selected={selectedExtras}
                    onSelect={setSelectedExtras}
                  />
                </Accordion>
              )}

              {/* Ingredients */}
              {item.customIngredients && item.customIngredients.length > 0 && (
                <Accordion
                  title="Customize Ingredients"
                  icon="settings-outline"
                  defaultOpen={false}
                >
                  <Text style={styles.accordionHelper}>Add or remove ingredients</Text>
                  <CheckboxGroup
                    options={createIngredientOptions(item.customIngredients)}
                    selected={selectedIngredients}
                    onSelect={setSelectedIngredients}
                  />
                </Accordion>
              )}

              {/* Quantity */}
              <View style={styles.quantitySection}>
                <Text style={styles.quantitySectionTitle}>Quantity</Text>
                <QuantitySelector
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                />
              </View>

              {/* Total Price Display */}
              <View style={styles.priceDisplay}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>${calculateTotal().toFixed(2)}</Text>
              </View>
            </View>

            {/* Add to Cart Button */}
            <View style={styles.buttonContainer}>
              <PrimaryButton title="Add to Cart" onPress={handleAddToCart} />
            </View>
          </View>
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
  successBanner: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  successText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "500",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 140,
  },
  imageContainer: {
    width: "100%",
    height: 300,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  price: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  description: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    fontWeight: "600",
  },
  longDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 21,
  },
  section: {
    gap: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  nutritionGrid: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  nutritionItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "flex-start",
    gap: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  allergenList: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  allergenBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  allergenText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#991B1B",
  },
  buttonContainer: {
    marginTop: 8,
  },
  customizationSection: {
    gap: 12,
    marginTop: 8,
  },
  accordionHelper: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
    fontStyle: "italic",
  },
  errorMessage: {
    fontSize: 13,
    color: "#DC2626",
    fontWeight: "700",
    marginTop: 8,
  },
  quantitySection: {
    gap: 10,
  },
  quantitySectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  priceDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
});
