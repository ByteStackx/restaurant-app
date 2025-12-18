import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { AuthInput } from "./components/AuthInput";
import { BottomTabs } from "./components/BottomTabs";
import { PrimaryButton } from "./components/PrimaryButton";
import { TopNav } from "./components/TopNav";
import { useAuth } from "./lib/auth-context";
import { listOrdersByUser, type OrderDoc } from "./services/firebase/order-service";
import { getUserProfile, updateUserProfile } from "./services/firebase/user-service";

export default function Account() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardName: "",
  });
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUserData({
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            email: profile.email || user.email || "",
            phone: profile.phone || "",
            addressLine1: profile.addressLine1 || "",
            addressLine2: profile.addressLine2 || "",
            city: profile.city || "",
            state: profile.state || "",
            zipCode: profile.zipCode || "",
            cardNumber: profile.cardNumber || "",
            cardExpiry: profile.cardExpiry || "",
            cardCvv: profile.cardCvv || "",
            cardName: profile.cardName || "",
          });
        } else {
          // Fallback if no profile exists
          setUserData((prev) => ({ ...prev, email: user.email || "" }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        Alert.alert("Error", "Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      if (!user) return;
      setOrdersLoading(true);
      setOrdersError(null);
      try {
        const data = await listOrdersByUser(user.uid);
        if (isMounted) setOrders(data);
      } catch (error) {
        console.error("Error loading orders:", error);
        if (isMounted) setOrdersError("Failed to load orders");
      } finally {
        if (isMounted) setOrdersLoading(false);
      }
    };
    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      await updateUserProfile(user.uid, userData);
      Alert.alert("Success", "Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // In real app, revert to previous state
  };

  const handleLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Log out",
          onPress: async () => {
            try {
              console.log("Starting logout process...");
              await logout();
              console.log("Logout complete, navigating to login");
              // Use replace to clear navigation stack and prevent back navigation
              router.replace("/login");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const formatCurrency = (value: number) => `R${value.toFixed(2)}`;
  const formatDate = (date?: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const statusPill = (status: OrderDoc["status"]) => {
    const labelMap: Record<OrderDoc["status"], string> = {
      pending: "Pending",
      paid: "Paid",
      failed: "Failed",
    };
    const colorMap: Record<OrderDoc["status"], string> = {
      pending: "#F59E0B",
      paid: "#10B981",
      failed: "#EF4444",
    };
    return (
      <View style={[styles.statusPill, { backgroundColor: `${colorMap[status]}20`, borderColor: colorMap[status] }]}> 
        <Text style={[styles.statusPillText, { color: colorMap[status] }]}>{labelMap[status]}</Text>
      </View>
    );
  };

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.page}>
          <TopNav />
          <View style={styles.emptyState}>
            <Ionicons name="person-circle-outline" size={80} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Sign in to view your account</Text>
            <Text style={styles.emptyText}>
              Create an account or sign in to manage your profile, orders, and preferences.
            </Text>
          </View>
        </View>
        <BottomTabs activeKey="account" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <TopNav />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#6B7280" />
            </View>
            <Text style={styles.profileName}>
              {userData.firstName || userData.lastName
                ? `${userData.firstName} ${userData.lastName}`.trim()
                : userData.email || "Account"}
            </Text>
            <Text style={styles.profileEmail}>{userData.email}</Text>
            {!isEditing && (
              <Pressable style={styles.editProfileButton} onPress={() => setIsEditing(true)}>
                <Ionicons name="pencil-outline" size={16} color="#111827" />
                <Text style={styles.editProfileText}>Edit profile</Text>
              </Pressable>
            )}
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color="#111827" />
              <Text style={styles.sectionTitle}>Personal information</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <AuthInput
                    label="First name"
                    value={userData.firstName}
                    onChangeText={(text) => setUserData({ ...userData, firstName: text })}
                    editable={isEditing}
                  />
                </View>
                <View style={styles.inputHalf}>
                  <AuthInput
                    label="Last name"
                    value={userData.lastName}
                    onChangeText={(text) => setUserData({ ...userData, lastName: text })}
                    editable={isEditing}
                  />
                </View>
              </View>
              <AuthInput
                label="Email address"
                value={userData.email}
                onChangeText={(text) => setUserData({ ...userData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={isEditing}
              />
              <AuthInput
                label="Phone number"
                value={userData.phone}
                onChangeText={(text) => setUserData({ ...userData, phone: text })}
                keyboardType="phone-pad"
                editable={isEditing}
              />
            </View>
          </View>

          {/* Delivery Address */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color="#111827" />
              <Text style={styles.sectionTitle}>Delivery address</Text>
            </View>
            <View style={styles.card}>
              <AuthInput
                label="Address line 1"
                value={userData.addressLine1}
                onChangeText={(text) => setUserData({ ...userData, addressLine1: text })}
                editable={isEditing}
              />
              <AuthInput
                label="Address line 2 (optional)"
                value={userData.addressLine2}
                onChangeText={(text) => setUserData({ ...userData, addressLine2: text })}
                editable={isEditing}
              />
              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <AuthInput
                    label="City"
                    value={userData.city}
                    onChangeText={(text) => setUserData({ ...userData, city: text })}
                    editable={isEditing}
                  />
                </View>
                <View style={styles.inputQuarter}>
                  <AuthInput
                    label="State"
                    value={userData.state}
                    onChangeText={(text) => setUserData({ ...userData, state: text })}
                    autoCapitalize="characters"
                    maxLength={2}
                    editable={isEditing}
                  />
                </View>
                <View style={styles.inputQuarter}>
                  <AuthInput
                    label="ZIP"
                    value={userData.zipCode}
                    onChangeText={(text) => setUserData({ ...userData, zipCode: text })}
                    keyboardType="number-pad"
                    maxLength={5}
                    editable={isEditing}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card-outline" size={20} color="#111827" />
              <Text style={styles.sectionTitle}>Payment method</Text>
            </View>
            <View style={styles.card}>
              <AuthInput
                label="Cardholder name"
                value={userData.cardName}
                onChangeText={(text) => setUserData({ ...userData, cardName: text })}
                editable={isEditing}
              />
              <AuthInput
                label="Card number"
                value={userData.cardNumber}
                onChangeText={(text) => setUserData({ ...userData, cardNumber: text })}
                keyboardType="number-pad"
                maxLength={19}
                editable={isEditing}
              />
              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <AuthInput
                    label="Expiry date (MM/YY)"
                    value={userData.cardExpiry}
                    onChangeText={(text) => setUserData({ ...userData, cardExpiry: text })}
                    placeholder="MM/YY"
                    keyboardType="number-pad"
                    maxLength={5}
                    editable={isEditing}
                  />
                </View>
                <View style={styles.inputHalf}>
                  <AuthInput
                    label="CVV"
                    value={userData.cardCvv}
                    onChangeText={(text) => setUserData({ ...userData, cardCvv: text })}
                    keyboardType="number-pad"
                    maxLength={3}
                    secureTextEntry
                    editable={isEditing}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Order History */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={20} color="#111827" />
              <Text style={styles.sectionTitle}>Order history</Text>
            </View>
            <View style={styles.card}>
              {ordersLoading ? (
                <Text style={styles.mutedText}>Loading orders...</Text>
              ) : ordersError ? (
                <Text style={[styles.mutedText, styles.errorText]}>{ordersError}</Text>
              ) : orders.length === 0 ? (
                <Text style={styles.mutedText}>No orders yet. Your past orders will appear here.</Text>
              ) : (
                orders.map((order) => {
                  const itemSummary = (order.items || [])
                    .map((item) => `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`)
                    .join(", ");
                  return (
                    <View key={order.id} style={styles.orderRow}>
                      <View style={styles.orderRowHeader}>
                        <View style={styles.orderRowLeft}>
                          <Text style={styles.orderDate}>{formatDate(order.createdAt || null)}</Text>
                          {statusPill(order.status)}
                        </View>
                        <Text style={styles.orderTotal}>{formatCurrency(order.totals?.total || 0)}</Text>
                      </View>
                      <Text style={styles.orderItems} numberOfLines={2}>
                        {itemSummary}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          {/* Account Actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings-outline" size={20} color="#111827" />
              <Text style={styles.sectionTitle}>Account settings</Text>
            </View>
            <View style={styles.card}>
              <Pressable style={styles.actionRow}>
                <View style={styles.actionContent}>
                  <Ionicons name="help-circle-outline" size={20} color="#111827" />
                  <Text style={styles.actionText}>Help & support</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
              <View style={styles.divider} />
              <Pressable style={styles.actionRow} onPress={handleLogout}>
                <View style={styles.actionContent}>
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                  <Text style={[styles.actionText, styles.actionTextDanger]}>Log out</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing && (
            <View style={styles.actionButtons}>
              <View style={styles.buttonHalf}>
                <Pressable style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
              <View style={styles.buttonHalf}>
                <PrimaryButton title="Save changes" onPress={handleSave} disabled={isSaving} />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
      <BottomTabs activeKey="account" />
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
    gap: 20,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  profileEmail: {
    fontSize: 14,
    color: "#6B7280",
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
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
    gap: 14,
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
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  actionTextDanger: {
    color: "#EF4444",
  },
  mutedText: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
  },
  orderRow: {
    gap: 6,
    paddingVertical: 6,
  },
  orderRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderDate: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  orderItems: {
    fontSize: 13,
    color: "#4B5563",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  errorText: {
    color: "#EF4444",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  buttonHalf: {
    flex: 1,
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
});

function parseDisplayName(displayName?: string | null, email?: string | null) {
  const fallback = email ? email.split("@")[0] : "";
  const safeName = (displayName || "").trim() || fallback;
  if (!safeName) {
    return { firstName: "", lastName: "" };
  }

  const parts = safeName.split(" ").filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}
