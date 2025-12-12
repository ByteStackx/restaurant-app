import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AdminTabs } from "../components/AdminTabs";
import { PrimaryButton } from "../components/PrimaryButton";
import { TopNav } from "../components/TopNav";

type FoodItem = { id: string; name: string; price: string };

const SAMPLE_ITEMS: FoodItem[] = [
  { id: "1", name: "Crispy Spring Rolls", price: "8.99" },
  { id: "2", name: "Garlic Bread", price: "6.99" },
];

export default function AdminFood() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <TopNav />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Manage Food Items</Text>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Add New Item</Text>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} placeholder="Item name" />
            <Text style={styles.label}>Price</Text>
            <TextInput style={styles.input} placeholder="0.00" keyboardType="decimal-pad" />
            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.inputMultiline} placeholder="Short description of the item" multiline numberOfLines={3} />

            <Text style={styles.sectionTitle}>Nutritional Info</Text>
            <View style={styles.row}>
              <View style={styles.inputQuarter}>
                <Text style={styles.label}>Calories</Text>
                <TextInput style={styles.input} placeholder="e.g., 450" keyboardType="number-pad" />
              </View>
              <View style={styles.inputQuarter}>
                <Text style={styles.label}>Protein (g)</Text>
                <TextInput style={styles.input} placeholder="e.g., 30" keyboardType="number-pad" />
              </View>
              <View style={styles.inputQuarter}>
                <Text style={styles.label}>Carbs (g)</Text>
                <TextInput style={styles.input} placeholder="e.g., 20" keyboardType="number-pad" />
              </View>
              <View style={styles.inputQuarter}>
                <Text style={styles.label}>Fat (g)</Text>
                <TextInput style={styles.input} placeholder="e.g., 15" keyboardType="number-pad" />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Allergens</Text>
            <Text style={styles.help}>Comma-separated (e.g., Fish, Nuts, Dairy)</Text>
            <TextInput style={styles.input} placeholder="Fish, Nuts" />

            <Text style={styles.sectionTitle}>Sides</Text>
            <Text style={styles.help}>Comma-separated (shown as selectable options)</Text>
            <TextInput style={styles.input} placeholder="Fries, Garden Salad, Coleslaw" />

            <Text style={styles.sectionTitle}>Drinks</Text>
            <Text style={styles.help}>Comma-separated (with optional price in parentheses)</Text>
            <TextInput style={styles.input} placeholder="Water(0), Coke(0), Juice(2.99)" />

            <Text style={styles.sectionTitle}>Extras</Text>
            <Text style={styles.help}>Comma-separated (with price, e.g., Extra Salmon(8.99))</Text>
            <TextInput style={styles.input} placeholder="Extra Salmon(8.99), Herb Butter(1.99)" />

            <Text style={styles.sectionTitle}>Custom Ingredients</Text>
            <Text style={styles.help}>Comma-separated (e.g., No Lemon, Extra Herbs)</Text>
            <TextInput style={styles.input} placeholder="No Lemon, Extra Herbs" />
            <PrimaryButton title="Add Item" onPress={() => {}} />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Existing Items</Text>
            {SAMPLE_ITEMS.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${item.price}</Text>
                </View>
                <Pressable style={styles.editBtn} onPress={() => {}}>
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.deleteBtn} onPress={() => {}}>
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
        <AdminTabs active="food" />
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
  label: { fontWeight: "700", color: "#111827" },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 12 },
  inputMultiline: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 12, minHeight: 90, textAlignVertical: "top" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  inputQuarter: { flex: 1 },
  itemName: { fontWeight: "700", color: "#111827" },
  itemPrice: { color: "#6B7280" },
  editBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: "#F3F4F6" },
  editText: { fontWeight: "700", color: "#111827" },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: "#FEE2E2" },
  deleteText: { fontWeight: "700", color: "#DC2626" },
  help: { color: "#6B7280", fontSize: 12 },
});
