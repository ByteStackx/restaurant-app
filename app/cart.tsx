import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { BottomTabs } from "./components/BottomTabs";
import { CheckboxGroup } from "./components/CheckboxGroup";
import { PrimaryButton } from "./components/PrimaryButton";
import { QuantitySelector } from "./components/QuantitySelector";
import { TopNav } from "./components/TopNav";

type CartItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  addons?: string[];
};

const INITIAL_ITEMS: CartItem[] = [
  {
    id: "5",
    name: "Grilled Salmon",
    description: "Roasted veggies, garlic mash, lemon butter",
    price: 24.99,
    quantity: 1,
    addons: ["No lemon", "Extra herbs"],
  },
  {
    id: "8",
    name: "Fries",
    description: "Sea salt, crispy, double portion",
    price: 5.99,
    quantity: 2,
  },
];

const EXTRAS_OPTIONS = [
  { id: "extra-salmon", label: "Extra Salmon", price: 8.99 },
  { id: "extra-butter", label: "Extra Herb Butter", price: 1.99 },
  { id: "extra-lemon", label: "Lemon Wedges", price: 0.99 },
  { id: "sauce-hollandaise", label: "Hollandaise Sauce", price: 2.49 },
  { id: "no-lemon", label: "No Lemon", price: 0 },
  { id: "extra-herbs", label: "Extra Herbs", price: 0 },
  { id: "no-butter", label: "No Butter", price: 0 },
  { id: "well-done", label: "Well Done", price: 0 },
];

export default function Cart() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempAddons, setTempAddons] = useState<string[]>([]);

  const isEmpty = items.length === 0;

  const updateQuantity = (itemId: string, nextQuantity: number) => {
    setItems((prev) => {
      const updated = prev.map((item) => (item.id === itemId ? { ...item, quantity: nextQuantity } : item));
      return updated.filter((item) => item.quantity >= 1);
    });
  };

  const updateAddons = (itemId: string, newAddons: string[]) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, addons: newAddons } : item)));
  };

  const clearCart = () => {
    setItems([]);
  };

  const openEditModal = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      setTempAddons(item.addons || []);
      setEditingItemId(itemId);
    }
  };

  const closeEditModal = () => {
    setEditingItemId(null);
    setTempAddons([]);
  };

  const saveAddons = () => {
    if (editingItemId) {
      updateAddons(editingItemId, tempAddons);
      closeEditModal();
    }
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = items.length > 0 ? 4.99 : 0;
    const taxes = subtotal * 0.08;
    const total = subtotal + deliveryFee + taxes;

    return { subtotal, deliveryFee, taxes, total };
  }, [items]);

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

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
                <Text style={styles.sectionLabel}>Delivery address</Text>
                <View style={styles.card}>
                  <View style={styles.addressRow}>
                    <View style={styles.addressIcon}>
                      <Ionicons name="location-outline" size={22} color="#111827" />
                    </View>
                    <View style={styles.addressText}>
                      <Text style={styles.addressTitle}>123 Market Street</Text>
                      <Text style={styles.addressMeta}>San Francisco, CA 94103</Text>
                      <Text style={styles.addressMeta}>Delivery · Today · 45-55 min</Text>
                    </View>
                    <Pressable style={styles.changeButton} onPress={() => console.log("Change address")}>
                      <Text style={styles.changeButtonText}>Change</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>Order summary</Text>
                  <Pressable onPress={clearCart}>
                    <Text style={styles.clearCartText}>Clear cart</Text>
                  </Pressable>
                </View>
                <View style={styles.card}>
                  {items.map((item, index) => {
                    const lineTotal = item.price * item.quantity;
                    return (
                      <View
                        key={item.id}
                        style={[styles.itemRow, index < items.length - 1 && styles.itemDivider]}
                      >
                        <View style={styles.itemHeader}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemPrice}>{formatCurrency(lineTotal)}</Text>
                        </View>
                        <View style={styles.descriptionRow}>
                          <Text style={styles.itemDescription}>{item.description}</Text>
                          <Pressable onPress={() => openEditModal(item.id)} style={styles.editButton}>
                            <Ionicons name="pencil-outline" size={16} color="#111827" />
                            <Text style={styles.editText}>Edit</Text>
                          </Pressable>
                        </View>
                        {item.addons && item.addons.length > 0 ? (
                          <View style={styles.addonRow}>
                            {item.addons.map((addon) => (
                              <Text key={addon} style={styles.addonTag}>
                                {addon}
                              </Text>
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
                          <Text style={styles.unitPrice}>{formatCurrency(item.price)} each</Text>
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

      {/* Edit Extras Modal */}
      <Modal
        visible={editingItemId !== null}
        transparent
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit extras</Text>
              <Pressable onPress={closeEditModal}>
                <Ionicons name="close" size={24} color="#111827" />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalHelper}>Select or deselect extras to customize your order</Text>
              <CheckboxGroup
                options={EXTRAS_OPTIONS}
                selected={tempAddons}
                onSelect={setTempAddons}
              />
            </ScrollView>
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
  addressRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  addressText: {
    flex: 1,
    gap: 4,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  addressMeta: {
    fontSize: 13,
    color: "#6B7280",
  },
  changeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#111827",
  },
  changeButtonText: {
    color: "#F9FAFB",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
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
  modalActions: {
    marginTop: 16,
  },
});
