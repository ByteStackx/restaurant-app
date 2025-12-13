import { router } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { BottomTabs } from "./components/BottomTabs";
import { TopNav } from "./components/TopNav";

export default function Home() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <TopNav />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Today</Text>
            <Text style={styles.title}>Fresh flavors waiting for you</Text>
            <Text style={styles.subtitle}>
              Explore the menu, reorder your favorites, and track your cart — all
              in one place.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick picks</Text>
            <View style={styles.cardRow}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Popular</Text>
                <Text style={styles.cardText}>Most ordered this week.</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Chef's choice</Text>
                <Text style={styles.cardText}>Seasonal highlights to try.</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>For later</Text>
            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>Save items to your cart</Text>
              <Text style={styles.bannerText}>
                Keep your favorites handy and check out when you're ready.
              </Text>
            </View>
          </View>
        </ScrollView>
        <Pressable 
  onPress={() => router.push("/admin" as any)}
  style={{ 
    padding: 16, 
    backgroundColor: "#ef4444", 
    margin: 20,
    borderRadius: 8 
  }}
>
  <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
    🔧 Admin Dashboard (Dev)
  </Text>
</Pressable>
      </View>
      <BottomTabs activeKey="home" />
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
    paddingTop: 20,
    paddingBottom: 140,
    gap: 20,
  },
  hero: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 20,
    gap: 10,
  },
  eyebrow: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#F9FAFB",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  subtitle: {
    color: "#E5E7EB",
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  cardRow: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  cardText: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 20,
  },
  banner: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  bannerText: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 20,
  },
});
