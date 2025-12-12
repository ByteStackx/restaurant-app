import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AdminTabs } from "../components/AdminTabs";
import { PrimaryButton } from "../components/PrimaryButton";
import { TopNav } from "../components/TopNav";

export default function AdminRestaurant() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <TopNav />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Restaurant Information</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Restaurant Name</Text>
            <TextInput style={styles.input} placeholder="e.g., ByteStack Bistro" />
            <Text style={styles.label}>Address</Text>
            <TextInput style={styles.input} placeholder="123 Main Street" />
            <Text style={styles.label}>City</Text>
            <TextInput style={styles.input} placeholder="San Francisco" />
            <Text style={styles.label}>State/Province</Text>
            <TextInput style={styles.input} placeholder="CA" />
            <Text style={styles.label}>ZIP</Text>
            <TextInput style={styles.input} placeholder="94103" keyboardType="number-pad" />
            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} placeholder="(555) 123-4567" keyboardType="phone-pad" />
            <Text style={styles.label}>Hours</Text>
            <TextInput style={styles.input} placeholder="Mon-Fri 9:00-18:00" />
            <PrimaryButton title="Save" onPress={() => {}} />
          </View>
        </ScrollView>
        <AdminTabs active="restaurant" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F3F4F6" },
  page: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 120 },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", padding: 16, gap: 10 },
  label: { fontWeight: "700", color: "#111827" },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 12 },
});
