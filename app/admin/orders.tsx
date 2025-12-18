import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { AdminBarChart } from "../components/AdminChart";
import { AdminTabs } from "../components/AdminTabs";
import { TopNav } from "../components/TopNav";
import { getAllOrders, OrderDoc } from "../services/firebase/order-service";

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await getAllOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        console.error("Error loading orders:", err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totals?.total || 0), 0);
    const statusCounts = orders.reduce(
      (acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const dailyRevenue = Object.entries(
      orders.reduce(
        (acc, o) => {
          const date = o.createdAt
            ? o.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "Unknown";
          acc[date] = (acc[date] || 0) + (o.totals?.total || 0);
          return acc;
        },
        {} as Record<string, number>
      )
    )
      .sort((a, b) => {
        // Sort by date - simple string comparison for now
        return a[0].localeCompare(b[0]);
      })
      .map(([label, value]) => ({ label, value: Math.round(value) }));

    return { totalRevenue, statusCounts, dailyRevenue };
  }, [orders]);

  const statusChartData = [
    { label: "Paid", value: stats.statusCounts.paid || 0 },
    { label: "Pending", value: stats.statusCounts.pending || 0 },
    { label: "Failed", value: stats.statusCounts.failed || 0 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <TopNav />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Orders & Analytics</Text>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#DC2626" />
            </View>
          ) : error ? (
            <View style={styles.card}>
              <Text style={[styles.metric, { color: "#EF4444" }]}>{error}</Text>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.metric}>Total Revenue: R{stats.totalRevenue.toFixed(2)}</Text>
                <Text style={styles.metric}>Orders: {orders.length}</Text>
              </View>

              <AdminBarChart title="Revenue by Day" data={stats.dailyRevenue} />
              <AdminBarChart title="Orders by Status" data={statusChartData} />

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Recent Orders</Text>
                {orders.length === 0 ? (
                  <Text style={styles.emptyText}>No orders yet</Text>
                ) : (
                  orders.slice(0, 10).map((o) => (
                    <View key={o.id} style={styles.row}>
                      <View style={styles.orderInfo}>
                        <Text style={styles.orderId}>{o.id.slice(0, 8)}...</Text>
                        <Text style={styles.orderDate}>
                          {o.createdAt ? o.createdAt.toLocaleDateString() : "Unknown"}
                        </Text>
                      </View>
                      <View style={styles.orderMeta}>
                        <Text
                          style={[
                            styles.orderStatus,
                            o.status === "paid"
                              ? styles.statusPaid
                              : o.status === "pending"
                                ? styles.statusPending
                                : styles.statusFailed,
                          ]}
                        >
                          {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                        </Text>
                        <Text style={styles.orderTotal}>R{(o.totals?.total || 0).toFixed(2)}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>
        <AdminTabs active="orders" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F3F4F6" },
  page: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 120 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", padding: 16, gap: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  orderInfo: { flex: 1, gap: 2 },
  orderId: { fontWeight: "700", color: "#111827", fontSize: 14 },
  orderDate: { color: "#6B7280", fontSize: 12 },
  orderMeta: { alignItems: "flex-end", gap: 4 },
  orderStatus: { fontSize: 12, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusPaid: { backgroundColor: "#D1FAE5", color: "#065F46" },
  statusPending: { backgroundColor: "#FEF3C7", color: "#92400E" },
  statusFailed: { backgroundColor: "#FEE2E2", color: "#991B1B" },
  orderTotal: { fontWeight: "700", color: "#111827", fontSize: 14 },
  metric: { fontWeight: "700", color: "#111827", fontSize: 15 },
  emptyText: { color: "#6B7280", fontStyle: "italic" },
});
