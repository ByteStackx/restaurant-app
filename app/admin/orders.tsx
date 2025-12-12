import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { AdminBarChart } from "../components/AdminChart";
import { AdminTabs } from "../components/AdminTabs";
import { TopNav } from "../components/TopNav";

const SAMPLE_ORDERS = [
  { id: "ord_1", total: 45.2, date: "2025-12-08", items: 3 },
  { id: "ord_2", total: 18.9, date: "2025-12-08", items: 1 },
  { id: "ord_3", total: 75.0, date: "2025-12-09", items: 4 },
];

export default function AdminOrders() {
  const totalsByDay = Object.values(
    SAMPLE_ORDERS.reduce<Record<string, number>>((acc, o) => {
      acc[o.date] = (acc[o.date] || 0) + o.total;
      return acc;
    }, {})
  );
  const chartData = Object.entries(
    SAMPLE_ORDERS.reduce<Record<string, number>>((acc, o) => {
      acc[o.date] = (acc[o.date] || 0) + o.total;
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value: Math.round(value) }));

  const totalRevenue = SAMPLE_ORDERS.reduce((sum, o) => sum + o.total, 0).toFixed(2);
  const totalOrders = SAMPLE_ORDERS.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <TopNav />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Orders & Analytics</Text>

          <View style={styles.card}>            
            <Text style={styles.metric}>Total Revenue: ${totalRevenue}</Text>
            <Text style={styles.metric}>Orders: {totalOrders}</Text>
          </View>

          <AdminBarChart title="Revenue by Day" data={chartData} />

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            {SAMPLE_ORDERS.map((o) => (
              <View key={o.id} style={styles.row}>
                <Text style={{ flex: 1, fontWeight: "700", color: "#111827" }}>{o.id}</Text>
                <Text style={{ width: 110, textAlign: "right", color: "#6B7280" }}>{o.date}</Text>
                <Text style={{ width: 80, textAlign: "right", fontWeight: "700", color: "#111827" }}>${o.total.toFixed(2)}</Text>
              </View>
            ))}
          </View>
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
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", padding: 16, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  metric: { fontWeight: "700", color: "#111827" },
});
