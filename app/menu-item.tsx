import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Accordion } from "./components/Accordion";
import { BottomTabs } from "./components/BottomTabs";
import { CheckboxGroup } from "./components/CheckboxGroup";
import { PrimaryButton } from "./components/PrimaryButton";
import { QuantitySelector } from "./components/QuantitySelector";
import { RadioGroup } from "./components/RadioGroup";
import { TopNav } from "./components/TopNav";

const SIDE_OPTIONS = [
  { id: "fries", label: "Fries" },
  { id: "salad", label: "Garden Salad" },
  { id: "coleslaw", label: "Coleslaw" },
  { id: "veggies", label: "Roasted Vegetables" },
];

const DRINK_OPTIONS = [
  { id: "water", label: "Water", price: 0 },
  { id: "coke", label: "Coca-Cola", price: 0 },
  { id: "sprite", label: "Sprite", price: 0 },
  { id: "juice", label: "Fresh Juice", price: 2.99 },
];

const EXTRAS_OPTIONS = [
  { id: "extra-salmon", label: "Extra Salmon", price: 8.99 },
  { id: "extra-butter", label: "Extra Herb Butter", price: 1.99 },
  { id: "extra-lemon", label: "Lemon Wedges", price: 0.99 },
  { id: "sauce-hollandaise", label: "Hollandaise Sauce", price: 2.49 },
];

const INGREDIENTS_OPTIONS = [
  { id: "no-lemon", label: "No Lemon", description: "Remove lemon zest" },
  { id: "extra-herbs", label: "Extra Herbs", description: "Double the herb seasoning" },
  { id: "no-butter", label: "No Butter", description: "Prepare dry" },
  { id: "well-done", label: "Well Done", description: "Cook longer for crispier exterior" },
];

export default function MenuItemDetail() {
  const [quantity, setQuantity] = useState(1);
  const [selectedSides, setSelectedSides] = useState<string[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<string>("");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // Mock item data - in a real app, this would come from route params
  const item = {
    id: "5",
    name: "Grilled Salmon",
    price: 24.99,
    description: "Fresh Atlantic salmon fillet with a perfect sear, served with herb butter.",
    longDescription:
      "Our signature grilled salmon is sourced fresh daily and prepared to perfection. The delicate fish is seasoned with a blend of Mediterranean herbs and finished with a touch of lemon zest. Served with roasted seasonal vegetables and creamy mashed potatoes.",
    imageUrl: undefined, // Placeholder
    allergens: ["Fish", "Shellfish", "Tree nuts"],
    nutritionInfo: {
      calories: 450,
      protein: 38,
      carbs: 12,
      fat: 22,
    },
  };

  const calculateTotal = () => {
    let total = item.price;

    // Add extras price
    selectedExtras.forEach((extraId) => {
      const extra = EXTRAS_OPTIONS.find((e) => e.id === extraId);
      if (extra) total += extra.price;
    });

    // Add drink price if applicable
    if (selectedDrink) {
      const drink = DRINK_OPTIONS.find((d) => d.id === selectedDrink);
      if (drink && drink.price > 0) total += drink.price;
    }

    return total * quantity;
  };

  const handleAddToCart = () => {
    const orderSummary = {
      itemId: item.id,
      quantity,
      sides: selectedSides.length > 0 ? selectedSides : "None",
      drink: selectedDrink || "None",
      extras: selectedExtras.length > 0 ? selectedExtras : "None",
      ingredients: selectedIngredients.length > 0 ? selectedIngredients : "None",
      totalPrice: calculateTotal(),
    };
    console.log("Added to cart:", orderSummary);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <TopNav />
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
            <Text style={styles.longDescription}>{item.longDescription}</Text>

            {/* Nutrition */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nutrition (per serving)</Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                  <Text style={styles.nutritionValue}>{item.nutritionInfo.calories}</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                  <Text style={styles.nutritionValue}>{item.nutritionInfo.protein}g</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                  <Text style={styles.nutritionValue}>{item.nutritionInfo.carbs}g</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                  <Text style={styles.nutritionValue}>{item.nutritionInfo.fat}g</Text>
                </View>
              </View>
            </View>

            {/* Allergens */}
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

            {/* Customization Options */}
            <View style={styles.customizationSection}>
              {/* Sides */}
              <Accordion
                title="Choose Your Sides"
                icon="checkmark-circle-outline"
                defaultOpen={false}
              >
                <Text style={styles.accordionHelper}>Select up to 2 sides (included in price)</Text>
                <CheckboxGroup
                  options={SIDE_OPTIONS}
                  selected={selectedSides}
                  onSelect={setSelectedSides}
                  maxSelections={2}
                />
              </Accordion>

              {/* Drinks */}
              <Accordion
                title="Add a Drink"
                icon="water-outline"
                defaultOpen={false}
              >
                <Text style={styles.accordionHelper}>Select one drink</Text>
                <RadioGroup
                  options={DRINK_OPTIONS}
                  selected={selectedDrink}
                  onSelect={setSelectedDrink}
                />
              </Accordion>

              {/* Extras */}
              <Accordion
                title="Add Extras"
                icon="add-circle-outline"
                defaultOpen={false}
              >
                <Text style={styles.accordionHelper}>Add extra items (additional charges apply)</Text>
                <CheckboxGroup
                  options={EXTRAS_OPTIONS}
                  selected={selectedExtras}
                  onSelect={setSelectedExtras}
                />
              </Accordion>

              {/* Ingredients */}
              <Accordion
                title="Customize Ingredients"
                icon="settings-outline"
                defaultOpen={false}
              >
                <Text style={styles.accordionHelper}>Add or remove ingredients</Text>
                <CheckboxGroup
                  options={INGREDIENTS_OPTIONS}
                  selected={selectedIngredients}
                  onSelect={setSelectedIngredients}
                />
              </Accordion>

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
