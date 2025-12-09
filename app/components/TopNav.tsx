import { StyleSheet, Text, View } from "react-native";

export function TopNav() {
  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoText}>LOGO</Text>
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
    width: 64,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#F9FAFB",
    fontWeight: "800",
    letterSpacing: 1,
  },
});
