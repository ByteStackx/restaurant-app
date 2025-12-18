import { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AdminTabs } from "../components/AdminTabs";
import { PrimaryButton } from "../components/PrimaryButton";
import { TopNav } from "../components/TopNav";
import { getRestaurantInfo, saveRestaurantInfo } from "../services/firebase/admin-service";

export default function AdminRestaurant() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getRestaurantInfo()
      .then((data) => {
        if (data) {
          setName(data.name || "");
          setAddress(data.address || "");
          setCity(data.city || "");
          setState(data.state || "");
          setZip(data.zip || "");
          setPhone(data.phone || "");
          setHours(data.hours || "");
        }
      })
      .catch((err) => {
        Alert.alert("Error", "Could not load restaurant info.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveRestaurantInfo({ name, address, city, state, zip, phone, hours });
      Alert.alert("Saved", "Restaurant info updated");
    } catch (err) {
      Alert.alert("Error", "Could not save restaurant info.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <TopNav />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Restaurant Information</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Restaurant Name</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="e.g., ByteStack Bistro" editable={!saving} />
            <Text style={styles.label}>Address</Text>
            <TextInput value={address} onChangeText={setAddress} style={styles.input} placeholder="123 Main Street" editable={!saving} />
            <Text style={styles.label}>City</Text>
            <TextInput value={city} onChangeText={setCity} style={styles.input} placeholder="San Francisco" editable={!saving} />
            <Text style={styles.label}>State/Province</Text>
            <TextInput value={state} onChangeText={setState} style={styles.input} placeholder="CA" editable={!saving} />
            <Text style={styles.label}>ZIP</Text>
            <TextInput value={zip} onChangeText={setZip} style={styles.input} placeholder="94103" keyboardType="number-pad" editable={!saving} />
            <Text style={styles.label}>Phone</Text>
            <TextInput value={phone} onChangeText={setPhone} style={styles.input} placeholder="(555) 123-4567" keyboardType="phone-pad" editable={!saving} />
            <Text style={styles.label}>Hours</Text>
            <TextInput value={hours} onChangeText={setHours} style={styles.input} placeholder="Mon-Fri 9:00-18:00" editable={!saving} />
            <PrimaryButton title={saving ? "Saving..." : "Save"} onPress={handleSave} disabled={saving || loading} />
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
