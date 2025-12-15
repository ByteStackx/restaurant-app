import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { BottomTabs } from "./components/BottomTabs";
import { CheckboxGroup } from "./components/CheckboxGroup";
import { PrimaryButton } from "./components/PrimaryButton";
import { QuantitySelector } from "./components/QuantitySelector";
import { RadioGroup } from "./components/RadioGroup";
import { TopNav } from "./components/TopNav";
import { useCart } from "./lib/cart-context";
import { getMenuItem, type MenuItem } from "./services/firebase/admin-service";

// Helper to parse item with price and convert to option format
const parseItemWithPrice = (item: string): { name: string; price: number } => {
  const match = item.match(/^(.+?)\(([0-9.]+)\)$/);
  if (match) {
    return { name: match[1].trim(), price: parseFloat(match[2]) };
  }
  return { name: item.trim(), price: 0 };
};

const createOptionsFromArray = (items: string[] | undefined) => {
  if (!items || items.length === 0) return [];
  return items.map((item, index) => {
    const { name, price } = parseItemWithPrice(item);
    return { id: `option-${index}`, label: name, price };
  });
};

export default function Cart() {
  const router = useRouter();
  const { items, updateItemQuantity, updateItemAtIndex, clear, total: cartSubtotal } = useCart();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [editingLoading, setEditingLoading] = useState(false);
  const [tempSides, setTempSides] = useState<string[]>([]);
  const [tempDrink, setTempDrink] = useState<string>("");
  const [tempExtras, setTempExtras] = useState<string[]>([]);
  const [tempIngredients, setTempIngredients] = useState<string[]>([]);
  const [tempAddons, setTempAddons] = useState<string[]>([]);

  const isEmpty = items.length === 0;

  const updateQuantity = (itemId: string, nextQuantity: number) => {
    updateItemQuantity(itemId, nextQuantity);
  };

  const clearCart = () => {
    clear();
  };

  const openEditModal = async (itemId: string, index: number) => {
    const item = items[index];
    if (item) {
      setEditingItemId(itemId);
      setEditingIndex(index);
      // Store the labels (not IDs) since that's what we saved in the cart
      setTempSides(item.sides || []);
      setTempDrink(item.drink || "");
      setTempExtras(item.extras || []);
      setTempIngredients(item.ingredients || []);
      const allSelected = [...(item.extras || []), ...(item.sides || [])];
      if (item.drink) allSelected.push(item.drink);
      setTempAddons(allSelected);
      
      setEditingLoading(true);
      try {
        const menuItem = await getMenuItem(itemId);
        if (menuItem) {
          setEditingMenuItem(menuItem);
        }
      } catch (err) {
        console.error("Error loading menu item for edit:", err);
      } finally {
        setEditingLoading(false);
      }
    }
  };

  const closeEditModal = () => {
    setEditingItemId(null);
    setEditingIndex(null);
    setEditingMenuItem(null);
    setTempSides([]);
    setTempDrink("");
    setTempExtras([]);
    setTempIngredients([]);
    setTempAddons([]);
  };

  const saveAddons = () => {
    if (editingIndex === null || !editingMenuItem) return;
    
    let newAddOnTotal = 0;
    
    // Create a map of label -> price for easy lookup
    const drinkMap = new Map<string, number>();
    const extraMap = new Map<string, number>();
    
    if (editingMenuItem.drinks) {
      editingMenuItem.drinks.forEach((drink) => {
        const { name, price } = parseItemWithPrice(drink);
        drinkMap.set(name, price);
      });
    }
    
    if (editingMenuItem.extras) {
      editingMenuItem.extras.forEach((extra) => {
        const { name, price } = parseItemWithPrice(extra);
        extraMap.set(name, price);
      });
    }
    
    // Calculate new addOnTotal
    if (tempDrink) {
      const price = drinkMap.get(tempDrink) || 0;
      if (price) newAddOnTotal += price;
    }
    
    tempExtras.forEach((extra) => {
      const price = extraMap.get(extra) || 0;
      if (price) newAddOnTotal += price;
    });
    
    updateItemAtIndex(editingIndex, {
      sides: tempSides,
      drink: tempDrink,
      extras: tempExtras,
      ingredients: tempIngredients,
      addOnTotal: newAddOnTotal,
    });
    
    closeEditModal();
  };

  // Helper to convert between option IDs and labels for editing
  const getSelectedOptionIds = (labels: string[], options: { id: string; label: string }[]) => {
    return labels
      .map((label) => options.find((opt) => opt.label === label)?.id)
      .filter((id) => id !== undefined) as string[];
  };

  const getSelectedLabels = (ids: string[], options: { id: string; label: string }[]) => {
    return ids
      .map((id) => options.find((opt) => opt.id === id)?.label)
      .filter((label) => label !== undefined) as string[];
  };

  const totals = useMemo(() => {
    const subtotal = cartSubtotal;
    const deliveryFee = items.length > 0 ? 4.99 : 0;
    const taxes = subtotal * 0.08;
    const grandTotal = subtotal + deliveryFee + taxes;

    return { subtotal, deliveryFee, taxes, total: grandTotal };
  }, [items, cartSubtotal]);

  const formatCurrency = (value: number) => `R${value.toFixed(2)}`;

  const handleGoToMenu = () => {
    router.push("/menu");
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
          {isEmpty ? (
            <View style={[styles.card, styles.emptyCard]}>
              <View style={styles.emptyIcon}> 
                <Ionicons name="cart-outline" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptySubtitle}>Add some tasty picks to get started.</Text>
              <PrimaryButton title="View menu" onPress={handleGoToMenu} />
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>Order summary</Text>
                  <Pressable onPress={clearCart}>
                    <Text style={styles.clearCartText}>Clear cart</Text>
                  </Pressable>
                </View>
                <View style={styles.card}>
                  {items.map((item, index) => {
                    const unitWithAddons = item.price + (item.addOnTotal || 0);
                    const lineTotal = unitWithAddons * item.quantity;
                    return (
                      <View
                        key={item.id}
                        style={[styles.itemRow, index < items.length - 1 && styles.itemDivider]}
                      >
                        <View style={styles.itemHeader}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={styles.itemPrice}>{formatCurrency(lineTotal)}</Text>
                            <Pressable onPress={() => openEditModal(item.id, index)} style={styles.editButton}>
                              <Ionicons name="pencil-outline" size={16} color="#111827" />
                              <Text style={styles.editText}>Edit</Text>
                            </Pressable>
                          </View>
                        </View>
                        {/* Show selected sides/drink/extras/ingredients if present */}
                        {(item.sides && item.sides.length > 0) || item.drink || (item.extras && item.extras.length > 0) || (item.ingredients && item.ingredients.length > 0) ? (
                          <View style={styles.addonRow}>
                            {item.sides?.map((s) => (
                              <Text key={`side-${s}`} style={styles.addonTag}>{s}</Text>
                            ))}
                            {item.drink ? (
                              <Text key={`drink-${item.drink}`} style={styles.addonTag}>{item.drink}</Text>
                            ) : null}
                            {item.extras?.map((e) => (
                              <Text key={`extra-${e}`} style={styles.addonTag}>{e}</Text>
                            ))}
                            {item.ingredients?.map((ing) => (
                              <Text key={`ing-${ing}`} style={styles.addonTag}>{ing}</Text>
                            ))}
                          </View>
                        ) : null}
                        <View style={styles.quantityRow}>
                          <QuantitySelector
                            quantity={item.quantity}
                            onQuantityChange={(qty) => updateQuantity(item.id, qty)}
                            min={0}
                            max={10}
                          />
                          <Text style={styles.unitPrice}>{formatCurrency(unitWithAddons)} each</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Totals</Text>
                <View style={styles.card}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>{formatCurrency(totals.subtotal)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Delivery fee</Text>
                    <Text style={styles.totalValue}>{formatCurrency(totals.deliveryFee)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Estimated taxes</Text>
                    <Text style={styles.totalValue}>{formatCurrency(totals.taxes)}</Text>
                  </View>
                  <View style={[styles.totalRow, styles.totalRowEmphasis]}>
                    <Text style={styles.totalLabelEmphasis}>Total</Text>
                    <Text style={styles.totalValueEmphasis}>{formatCurrency(totals.total)}</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {!isEmpty && (
          <View style={styles.checkoutBar}>
            <View style={styles.checkoutSummary}>
              <Text style={styles.checkoutLabel}>Total</Text>
              <Text style={styles.checkoutValue}>{formatCurrency(totals.total)}</Text>
            </View>
            <PrimaryButton
              title={`Checkout ${formatCurrency(totals.total)}`}
              onPress={() => router.push("/checkout")}
            />
          </View>
        )}
      </View>
      <BottomTabs activeKey="cart" />

      {/* Edit Customizations Modal */}
      <Modal
        visible={editingItemId !== null}
        transparent
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit customizations</Text>
              <Pressable onPress={closeEditModal}>
                <Ionicons name="close" size={24} color="#111827" />
              </Pressable>
            </View>
            {editingLoading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#DC2626" />
              </View>
            ) : editingMenuItem ? (
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {editingMenuItem.sides && editingMenuItem.sides.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Sides</Text>
                    <CheckboxGroup
                      options={createOptionsFromArray(editingMenuItem.sides)}
                      selected={getSelectedOptionIds(tempSides, createOptionsFromArray(editingMenuItem.sides))}
                      onSelect={(ids) => setTempSides(getSelectedLabels(ids, createOptionsFromArray(editingMenuItem.sides)))}
                      maxSelections={2}
                    />
                  </View>
                )}
                {editingMenuItem.drinks && editingMenuItem.drinks.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Drink</Text>
                    <RadioGroup
                      options={createOptionsFromArray(editingMenuItem.drinks)}
                      selected={getSelectedOptionIds([tempDrink], createOptionsFromArray(editingMenuItem.drinks))[0] || ""}
                      onSelect={(id) => setTempDrink(getSelectedLabels([id], createOptionsFromArray(editingMenuItem.drinks))[0] || "")}
                    />
                  </View>
                )}
                {editingMenuItem.extras && editingMenuItem.extras.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Extras</Text>
                    <CheckboxGroup
                      options={createOptionsFromArray(editingMenuItem.extras)}
                      selected={getSelectedOptionIds(tempExtras, createOptionsFromArray(editingMenuItem.extras))}
                      onSelect={(ids) => setTempExtras(getSelectedLabels(ids, createOptionsFromArray(editingMenuItem.extras)))}
                    />
                  </View>
                )}
                {editingMenuItem.customIngredients && editingMenuItem.customIngredients.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Customize</Text>
                    <CheckboxGroup
                      options={createOptionsFromArray(editingMenuItem.customIngredients)}
                      selected={getSelectedOptionIds(tempIngredients, createOptionsFromArray(editingMenuItem.customIngredients))}
                      onSelect={(ids) => setTempIngredients(getSelectedLabels(ids, createOptionsFromArray(editingMenuItem.customIngredients)))}
                    />
                  </View>
                )}
              </ScrollView>
            ) : (
              <View style={styles.centerContainer}>
                <Text style={styles.modalHelper}>Could not load item options</Text>
              </View>
            )}
            <View style={styles.modalActions}>
              <PrimaryButton title="Save changes" onPress={saveAddons} />
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 180,
    gap: 18,
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  clearCartText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EF4444",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    gap: 12,
  },
  itemRow: {
    gap: 8,
    paddingVertical: 6,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 12,
    marginBottom: 6,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  descriptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  itemDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 19,
    flex: 1,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  editText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  addonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  addonTag: {
    backgroundColor: "#F3F4F6",
    color: "#374151",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontWeight: "700",
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unitPrice: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "700",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
  },
  totalRowEmphasis: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalLabelEmphasis: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "900",
  },
  totalValueEmphasis: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "900",
  },
  checkoutBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 10,
  },
  checkoutSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkoutLabel: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "700",
  },
  checkoutValue: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "900",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalHelper: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  modalActions: {
    marginTop: 16,
  },
});
