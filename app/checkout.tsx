import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { AuthInput } from "./components/AuthInput";
import { BottomTabs } from "./components/BottomTabs";
import { PrimaryButton } from "./components/PrimaryButton";
import { TopNav } from "./components/TopNav";
import { useAuth } from "./lib/auth-context";
import { useCart } from "./lib/cart-context";
import { createOrder } from "./services/firebase/order-service";
import { getUserProfile, type UserProfile } from "./services/firebase/user-service";

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, total: cartSubtotal, clear } = useCart();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("default");
  const [selectedCardId, setSelectedCardId] = useState<string>("default");
  const [showCardModal, setShowCardModal] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [newCard, setNewCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [newAddress, setNewAddress] = useState({
    label: "Other",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
  });

  // Load user profile for default address and card
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Failed to load user profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const savedAddresses = useMemo(() => {
    if (!userProfile) return [];
    return [
      {
        id: "default",
        label: "Default Address",
        line1: userProfile.addressLine1,
        line2: userProfile.addressLine2,
        cityStateZip: `${userProfile.city}, ${userProfile.state} ${userProfile.zipCode}`,
        note: "From your profile",
      },
    ];
  }, [userProfile]);

  const savedCards = useMemo(() => {
    if (!userProfile || !userProfile.cardNumber) return [];
    const last4 = userProfile.cardNumber.slice(-4);
    return [
      {
        id: "default",
        brand: "Card",
        last4,
        expiry: userProfile.cardExpiry,
        name: userProfile.cardName,
      },
    ];
  }, [userProfile]);

  const totals = useMemo(() => {
    const subtotal = cartSubtotal;
    const deliveryFee = items.length > 0 ? 4.99 : 0;
    const taxes = subtotal * 0.08;
    const total = subtotal + deliveryFee + taxes;
    return { subtotal, deliveryFee, taxes, total };
  }, [items, cartSubtotal]);

  const formatCurrency = (value: number) => `R${value.toFixed(2)}`;

  const processStripePayment = async (amount: number) => {
    const endpoint = process.env.EXPO_PUBLIC_STRIPE_PAYMENT_ENDPOINT;
    if (!endpoint) {
      throw new Error("Stripe payment endpoint not configured. Set EXPO_PUBLIC_STRIPE_PAYMENT_ENDPOINT.");
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "zar",
        description: "Restaurant order",
        // Set to true for DEV to request server auto-confirm with test method
        confirm: true,
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Stripe payment failed.");
    }

    const data = await response.json();
    return {
      intentId: data.paymentIntentId || data.intentId || data.id,
      status: data.status || "requires_confirmation",
    };
  };

  const isUsingNewAddress = selectedAddressId === "new";

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "").replace(/\D/g, "");
    const limited = cleaned.substring(0, 16);
    const match = limited.match(/.{1,4}/g);
    return match ? match.join(" ") : limited;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleAddCard = () => {
    // Validate card details
    const cleanedNumber = newCard.number.replace(/\s/g, "");
    if (cleanedNumber.length < 13 || cleanedNumber.length > 16) {
      Alert.alert("Invalid Card", "Please enter a valid card number.");
      return;
    }
    if (newCard.expiry.length !== 5 || !newCard.expiry.includes("/")) {
      Alert.alert("Invalid Expiry", "Please enter expiry in MM/YY format.");
      return;
    }
    if (newCard.cvv.length < 3) {
      Alert.alert("Invalid CVV", "Please enter a valid CVV.");
      return;
    }
    if (!newCard.name.trim()) {
      Alert.alert("Invalid Name", "Please enter the cardholder name.");
      return;
    }

    // Select the new card
    setSelectedCardId("new-card");
    setShowCardModal(false);
    Alert.alert("Card Added", "Your new card has been added successfully.");
  };

  const handlePlaceOrder = async () => {
    if (placingOrder) return;

    // Validate address
    if (isUsingNewAddress) {
      if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.zip) {
        Alert.alert("Missing Information", "Please fill in all required address fields.");
        return;
      }
    } else if (savedAddresses.length === 0) {
      Alert.alert("Add an address", "Please add a delivery address before placing your order.");
      setSelectedAddressId("new");
      return;
    }

    // Validate payment method
    if (savedCards.length === 0 && selectedCardId === "default") {
      Alert.alert("No Payment Method", "Please add a payment card to your profile.");
      return;
    }

    if (selectedCardId === "new-card") {
      // Using the newly added card
      const cleanedNumber = newCard.number.replace(/\s/g, "");
      if (!cleanedNumber || cleanedNumber.length < 13) {
        Alert.alert("Invalid Card", "Please add a valid payment card.");
        return;
      }
    }

    setPlacingOrder(true);

    try {
      const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId);
      const addressString = isUsingNewAddress
        ? `${newAddress.line1}, ${newAddress.city} ${newAddress.state} ${newAddress.zip}`
        : selectedAddress
        ? `${selectedAddress.line1}${selectedAddress.line2 ? ", " + selectedAddress.line2 : ""}, ${selectedAddress.cityStateZip}`
        : "";

      const last4 =
        selectedCardId === "new-card"
          ? newCard.number.replace(/\s/g, "").slice(-4)
          : savedCards.find((c) => c.id === selectedCardId)?.last4;

      const payment = await processStripePayment(totals.total);

      const orderItems = items.map((item) => {
        const addOnTotal = item.addOnTotal || 0;
        return {
          itemId: item.id,
          name: item.name,
          quantity: item.quantity,
          basePrice: item.price,
          addOnTotal,
          lineTotal: (item.price + addOnTotal) * item.quantity,
          selections: {
            ...(item.sides && item.sides.length ? { sides: item.sides } : {}),
            ...(item.drink ? { drink: item.drink } : {}),
            ...(item.extras && item.extras.length ? { extras: item.extras } : {}),
            ...(item.ingredients && item.ingredients.length ? { ingredients: item.ingredients } : {}),
          },
          ...(item.imageUrl ? { imageUrl: item.imageUrl } : {}),
        };
      });

      await createOrder({
        userId: user?.uid ?? null,
        status: payment.status === "succeeded" || payment.status === "requires_capture" ? "paid" : "pending",
        address: addressString,
        items: orderItems,
        totals: { ...totals, currency: "ZAR" },
        payment: {
          provider: "stripe",
          status: payment.status,
          intentId: payment.intentId,
          amount: totals.total,
          currency: "ZAR",
          ...(last4 ? { last4 } : {}),
          methodType: "card",
        },
        contactName: userProfile ? `${userProfile.firstName} ${userProfile.lastName}`.trim() : undefined,
        contactPhone: userProfile?.phone,
      });

      Alert.alert(
        "Order Placed!",
        `Your order of ${formatCurrency(totals.total)} has been placed successfully.`,
        [
          {
            text: "OK",
            onPress: () => {
              clear();
              router.push("/menu");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Failed to place order:", error);
      const message = error instanceof Error ? error.message : "We couldn't process your payment. Please try again.";
      Alert.alert("Payment failed", message);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <TopNav />
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#DC2626" />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="cart-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Add items to your cart before checking out.</Text>
            <PrimaryButton title="Go to Menu" onPress={() => router.push("/menu")} />
          </View>
        ) : (
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
              {savedAddresses.map((address) => {
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
              {savedCards.map((card) => {
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
              {selectedCardId === "new-card" && newCard.number && (
                <Pressable
                  style={[styles.row, styles.selectRow]}
                  onPress={() => setSelectedCardId("new-card")}
                >
                  <View style={styles.radioOuter}>
                    <View style={styles.radioInner} />
                  </View>
                  <View style={styles.paymentText}>
                    <Text style={styles.paymentLabel}>{newCard.name}</Text>
                    <Text style={styles.paymentMeta}>•••• {newCard.number.slice(-4)} · Expires {newCard.expiry}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                </Pressable>
              )}
              <Pressable style={styles.addCardButton} onPress={() => setShowCardModal(true)}> 
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
              {items.map((item, index) => {
                const itemTotal = (item.price + (item.addOnTotal || 0)) * item.quantity;
                return (
                  <View key={`${item.id}-${index}`} style={styles.totalRow}>
                    <Text style={styles.totalLabel}>
                      {item.name} {item.quantity > 1 && `(×${item.quantity})`}
                    </Text>
                    <Text style={styles.totalValue}>{formatCurrency(itemTotal)}</Text>
                  </View>
                );
              })}
              <View style={[styles.totalRow, styles.divider]}>
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
        )}

        {!loading && items.length > 0 && (
          <View style={styles.footer}>
            <View>
              <Text style={styles.footerLabel}>Paying</Text>
              <Text style={styles.footerValue}>{formatCurrency(totals.total)}</Text>
            </View>
            <PrimaryButton title={placingOrder ? "Placing..." : "Place order"} onPress={handlePlaceOrder} disabled={placingOrder} />
          </View>
        )}
      </View>
      <BottomTabs activeKey="cart" />

      {/* Add Card Modal */}
      <Modal
        visible={showCardModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCardModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowCardModal(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Payment Card</Text>
                <Pressable onPress={() => setShowCardModal(false)}>
                  <Ionicons name="close" size={24} color="#111827" />
                </Pressable>
              </View>
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.modalForm}>
                  <AuthInput
                    label="Card number"
                    value={newCard.number}
                    onChangeText={(text) => setNewCard({ ...newCard, number: formatCardNumber(text) })}
                    keyboardType="number-pad"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  <View style={styles.cardRow}>
                    <View style={styles.cardHalf}>
                      <AuthInput
                        label="Expiry date"
                        value={newCard.expiry}
                        onChangeText={(text) => setNewCard({ ...newCard, expiry: formatExpiry(text) })}
                        keyboardType="number-pad"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </View>
                    <View style={styles.cardHalf}>
                      <AuthInput
                        label="CVV"
                        value={newCard.cvv}
                        onChangeText={(text) => setNewCard({ ...newCard, cvv: text.replace(/\D/g, "") })}
                        keyboardType="number-pad"
                        placeholder="123"
                        maxLength={4}
                        secureTextEntry
                      />
                    </View>
                  </View>
                  <AuthInput
                    label="Cardholder name"
                    value={newCard.name}
                    onChangeText={(text) => setNewCard({ ...newCard, name: text })}
                    placeholder="John Doe"
                    autoCapitalize="words"
                  />
                </View>
              </ScrollView>
              <View style={styles.modalActions}>
                <PrimaryButton title="Add Card" onPress={handleAddCard} />
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
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
  divider: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
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
  modalForm: {
    gap: 16,
  },
  cardRow: {
    flexDirection: "row",
    gap: 12,
  },
  cardHalf: {
    flex: 1,
  },
  modalActions: {
    marginTop: 16,
  },
});
