import { ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
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
          <ImageBackground
            source={require("../assets/images/bg-image.jpg")}
            style={styles.hero}
            imageStyle={styles.heroImage}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay}>
              <Text style={styles.eyebrow}>Today</Text>
              <Text style={styles.title}>Fresh flavors waiting for you</Text>
              <Text style={styles.subtitle}>
                Explore the menu, reorder your favorites, and track your cart — all
                in one place.
              </Text>
            </View>
          </ImageBackground>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick picks</Text>
            <View style={styles.cardRow}>
              <ImageBackground
                source={require("../assets/images/bg-menu.jpg")}
                style={styles.card}
                imageStyle={styles.cardImage}
                resizeMode="cover"
              >
                <View style={styles.cardOverlay}>
                  <Text style={styles.cardTitle}>Explore our menu</Text>
                  <Text style={styles.cardText}>So many delicious options to choose from.</Text>
                </View>
              </ImageBackground>
              <ImageBackground
                source={require("../assets/images/bg-cf.jpg")}
                style={styles.card}
                imageStyle={styles.cardImage}
                resizeMode="cover"
              >
                <View style={styles.cardOverlay}>
                  <Text style={styles.cardTitle}>Chef's choice</Text>
                  <Text style={styles.cardText}>Seasonal highlights to try.</Text>
                </View>
              </ImageBackground>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>For later</Text>
            <ImageBackground
              source={require("../assets/images/bg-cart.jpg")}
              style={styles.banner}
              imageStyle={styles.bannerImage}
              resizeMode="cover"
            >
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>Save items to your cart</Text>
                <Text style={styles.bannerText}>
                  Keep your favorites handy and check out when you're ready.
                </Text>
              </View>
            </ImageBackground>
          </View>
        </ScrollView>
        {/* <Pressable 
  onPress={() => router.push("/admin" as any)}
  style={{ 
    padding: 16, 
    backgroundColor: "#ef4444", 
    margin: 20,
    borderRadius: 8 
  }}
>
  <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
    Admin Dashboard (Dev)
  </Text>
</Pressable> */}
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
    overflow: "hidden",
  },
  heroImage: {
    borderRadius: 18,
  },
  heroOverlay: {
    backgroundColor: "rgba(17, 24, 39, 0.55)",
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
    borderRadius: 16,
    minHeight: 140,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardImage: {
    borderRadius: 16,
  },
  cardOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    padding: 24,
    gap: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  cardText: {
    color: "#3b414aff",
    fontSize: 14,
    lineHeight: 20,
  },
  banner: {
    borderRadius: 16,
    minHeight: 120,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bannerImage: {
    borderRadius: 16,
  },
  bannerOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    padding: 24,
    gap: 10,
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  bannerText: {
    color: "#1c2025ff",
    fontSize: 14,
    lineHeight: 20,
  },
});
