import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { AuthInput } from "./components/AuthInput";
import { BottomTabs } from "./components/BottomTabs";
import { PrimaryButton } from "./components/PrimaryButton";
import { TopNav } from "./components/TopNav";

const SAVED_ADDRESSES = [
  {
    id: "home",
    label: "Home",
    line1: "123 Market Street",
    line2: "Apt 4B",
    cityStateZip: "San Francisco, CA 94103",
    note: "Default",
  },
  {
    id: "office",
    label: "Office",
    line1: "456 Mission Street",
    line2: "Suite 210",
    cityStateZip: "San Francisco, CA 94105",
    note: "Weekdays",
  },
];

const SAVED_CARDS = [
  { id: "card-1", brand: "Visa", last4: "4242", expiry: "12/25" },
  { id: "card-2", brand: "Mastercard", last4: "8844", expiry: "09/26" },
];

const ORDER_ITEMS = [
  { id: "5", name: "Grilled Salmon", total: 24.99 },
  { id: "8", name: "Fries", total: 11.98 },
];

export default function Checkout() {
  const [selectedAddressId, setSelectedAddressId] = useState<string>(SAVED_ADDRESSES[0].id);
  const [selectedCardId, setSelectedCardId] = useState<string>(SAVED_CARDS[0].id);
  const [newAddress, setNewAddress] = useState({
    label: "Other",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
  });

  const totals = useMemo(() => {
    const subtotal = ORDER_ITEMS.reduce((sum, item) => sum + item.total, 0);
    const deliveryFee = 4.99;
    const taxes = subtotal * 0.08;
    const total = subtotal + deliveryFee + taxes;
    return { subtotal, deliveryFee, taxes, total };
  }, []);

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  const isUsingNewAddress = selectedAddressId === "new";

  const handlePlaceOrder = () => {
    const address = isUsingNewAddress
      ? `${newAddress.line1}, ${newAddress.city} ${newAddress.state} ${newAddress.zip}`
      : selectedAddressId;
    console.log("Placing order with", {
      address,
      card: selectedCardId,
      totals,
    });
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
          {/* Delivery Address */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color="#111827" />
              <Text style={styles.sectionTitle}>Drop-off address</Text>
            </View>
            <View style={styles.card}>
              {SAVED_ADDRESSES.map((address) => {
                const selected = selectedAddressId === address.id;
                return (
                  <Pressable
                    key={address.id}
                    style={[styles.row, styles.selectRow]}
                    onPress={() => setSelectedAddressId(address.id)}
                  >
                    <View style={styles.radioOuter}>
                      {selected ? <View style={styles.radioInner} /> : null}
                    </View>
                    <View style={styles.addressText}>
                      <Text style={styles.addressLabel}>{address.label}</Text>
                      <Text style={styles.addressLine}>{address.line1}</Text>
                      {address.line2 ? <Text style={styles.addressLine}>{address.line2}</Text> : null}
                      <Text style={styles.addressLine}>{address.cityStateZip}</Text>
                      {address.note ? <Text style={styles.addressNote}>{address.note}</Text> : null}
                    </View>
                  </Pressable>
                );
              })}
              <Pressable
                style={[styles.row, styles.selectRow]}
                onPress={() => setSelectedAddressId("new")}
              >
                <View style={styles.radioOuter}>
                  {isUsingNewAddress ? <View style={styles.radioInner} /> : null}
                </View>
                <View style={styles.addressText}>
                  <Text style={styles.addressLabel}>Deliver to a different address</Text>
                  <Text style={styles.addressNote}>Enter a new drop-off location</Text>
                </View>
              </Pressable>

              {isUsingNewAddress && (
                <View style={styles.newAddressForm}>
                  <AuthInput
                    label="Address line 1"
                    value={newAddress.line1}
                    onChangeText={(text) => setNewAddress({ ...newAddress, line1: text })}
                  />
                  <AuthInput
                    label="Address line 2 (optional)"
                    value={newAddress.line2}
                    onChangeText={(text) => setNewAddress({ ...newAddress, line2: text })}
                  />
                  <View style={styles.inputRow}>
                    <View style={styles.inputHalf}>
                      <AuthInput
                        label="City"
                        value={newAddress.city}
                        onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
                      />
                    </View>
                    <View style={styles.inputQuarter}>
                      <AuthInput
                        label="State"
                        value={newAddress.state}
                        onChangeText={(text) => setNewAddress({ ...newAddress, state: text })}
                        autoCapitalize="characters"
                        maxLength={2}
                      />
                    </View>
                    <View style={styles.inputQuarter}>
                      <AuthInput
                        label="ZIP"
                        value={newAddress.zip}
                        onChangeText={(text) => setNewAddress({ ...newAddress, zip: text })}
                        keyboardType="number-pad"
                        maxLength={5}
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card-outline" size={20} color="#111827" />
              <Text style={styles.sectionTitle}>Payment method</Text>
            </View>
            <View style={styles.card}>
              {SAVED_CARDS.map((card) => {
                const selected = selectedCardId === card.id;
                return (
                  <Pressable
                    key={card.id}
                    style={[styles.row, styles.selectRow]}
                    onPress={() => setSelectedCardId(card.id)}
                  >
                    <View style={styles.radioOuter}>
                      {selected ? <View style={styles.radioInner} /> : null}
                    </View>
                    <View style={styles.paymentText}>
                      <Text style={styles.paymentLabel}>{card.brand}</Text>
                      <Text style={styles.paymentMeta}>•••• {card.last4} · Expires {card.expiry}</Text>
                    </View>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                    ) : null}
                  </Pressable>
                );
              })}
              <Pressable style={styles.addCardButton} onPress={() => console.log("Add card")}> 
                <Ionicons name="add" size={18} color="#111827" />
                <Text style={styles.addCardText}>Use a different card</Text>
              </Pressable>
            </View>
          </View>

          {/* Order Totals */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="receipt-outline" size={20} color="#111827" />
              <Text style={styles.sectionTitle}>Order total</Text>
            </View>
            <View style={styles.card}>
              {ORDER_ITEMS.map((item) => (
                <View key={item.id} style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{item.name}</Text>
                  <Text style={styles.totalValue}>{formatCurrency(item.total)}</Text>
                </View>
              ))}
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
        </ScrollView>

        <View style={styles.footer}>
          <View>
            <Text style={styles.footerLabel}>Paying</Text>
            <Text style={styles.footerValue}>{formatCurrency(totals.total)}</Text>
          </View>
          <PrimaryButton title="Place order" onPress={handlePlaceOrder} />
        </View>
      </View>
      <BottomTabs activeKey="cart" />
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
    paddingBottom: 140,
    gap: 18,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  selectRow: {
    alignItems: "flex-start",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#111827",
  },
  addressText: {
    flex: 1,
    gap: 2,
  },
  addressLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  addressLine: {
    fontSize: 13,
    color: "#4B5563",
  },
  addressNote: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
  newAddressForm: {
    marginTop: 4,
    gap: 10,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  inputQuarter: {
    flex: 0.5,
  },
  paymentText: {
    flex: 1,
    gap: 2,
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  paymentMeta: {
    fontSize: 13,
    color: "#4B5563",
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  addCardText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
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
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
  },
  totalLabelEmphasis: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  totalValueEmphasis: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  footer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  footerLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
  },
  footerValue: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "900",
  },
});
