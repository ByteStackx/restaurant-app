import { StyleSheet, Text, View } from "react-native";

export function TopNav() {
  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoText}>Flavoré</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    alignItems: "center",
  },
  logoBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 24,
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
});
