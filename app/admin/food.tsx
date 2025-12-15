import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AdminTabs } from "../components/AdminTabs";
import { FoodTypeSlider } from "../components/FoodTypeSlider";
import { PrimaryButton } from "../components/PrimaryButton";
import { TopNav } from "../components/TopNav";
import { createMenuItem, deleteMenuItem, listMenuItems, MenuItem, updateMenuItem } from "../services/firebase/admin-service";
import { storage } from "../services/firebase/firebase";

export default function AdminFood() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [foodType, setFoodType] = useState("mains");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [allergens, setAllergens] = useState("");
  const [sides, setSides] = useState("");
  const [drinks, setDrinks] = useState("");
  const [extras, setExtras] = useState("");
  const [customIngredients, setCustomIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  useEffect(() => {
    setLoading(true);
    listMenuItems()
      .then((data) => setItems(data))
      .catch((err) => {
        console.log("Failed to load menu items", err);
        Alert.alert("Error", "Could not load menu items.");
      })
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setDescription("");
    setLongDescription("");
    setImageUri("");
    setFoodType("mains");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setAllergens("");
    setSides("");
    setDrinks("");
    setExtras("");
    setCustomIngredients("");
    setErrors({});
  };

  const parseList = (value: string) =>
    value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImageIfNeeded = async (id: string, uri: string) => {
    if (!uri) return undefined;
    if (uri.startsWith("http")) return uri;
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = ref(storage, `menuItems/${id}.jpg`);
    await uploadBytes(fileRef, blob);
    return await getDownloadURL(fileRef);
  };

  const handleSave = async () => {
    const validationErrors: { name?: string; price?: string } = {};

    if (!name.trim()) {
      validationErrors.name = "Name is required";
    }

    const priceNumber = parseFloat(price);
    if (!price.trim()) {
      validationErrors.price = "Price is required";
    } else if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      validationErrors.price = "Enter a valid price greater than 0";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert("Validation Error", "Please fix the errors before saving");
      return;
    }

    setErrors({});

    const payload: MenuItem = {
      name: name.trim(),
      price: priceNumber,
      description: description.trim(),
      longDescription: longDescription.trim() || undefined,
      foodType,
      calories: calories ? Number(calories) : undefined,
      protein: protein ? Number(protein) : undefined,
      carbs: carbs ? Number(carbs) : undefined,
      fat: fat ? Number(fat) : undefined,
      allergens: parseList(allergens),
      sides: parseList(sides),
      drinks: parseList(drinks),
      extras: parseList(extras),
      customIngredients: parseList(customIngredients),
    };

    setSaving(true);
    try {
      if (editingId) {
        const uploadedUrl = imageUri ? await uploadImageIfNeeded(editingId, imageUri) : undefined;
        await updateMenuItem(editingId, { ...payload, ...(uploadedUrl ? { imageUrl: uploadedUrl } : {}) });
        setItems((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  ...payload,
                  imageUrl: uploadedUrl || item.imageUrl,
                }
              : item
          )
        );
        Alert.alert("Updated", "Menu item updated");
      } else {
        const newId = await createMenuItem(payload);
        let uploadedUrl: string | undefined;
        if (imageUri) {
          uploadedUrl = await uploadImageIfNeeded(newId, imageUri);
          if (uploadedUrl) {
            await updateMenuItem(newId, { imageUrl: uploadedUrl });
          }
        }
        setItems((prev) => [...prev, { ...payload, id: newId, imageUrl: uploadedUrl }]);
        Alert.alert("Added", "Menu item created");
      }
      resetForm();
    } catch (err) {
      console.log("Save failed", err);
      Alert.alert("Error", "Could not save item.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id || null);
    setName(item.name || "");
    setPrice(item.price?.toString() || "");
    setDescription(item.description || "");
    setLongDescription(item.longDescription || "");
    setImageUri(item.imageUrl || "");
    setFoodType(item.foodType || "mains");
    setCalories(item.calories?.toString() || "");
    setProtein(item.protein?.toString() || "");
    setCarbs(item.carbs?.toString() || "");
    setFat(item.fat?.toString() || "");
    setAllergens((item.allergens || []).join(", "));
    setSides((item.sides || []).join(", "));
    setDrinks((item.drinks || []).join(", "));
    setExtras((item.extras || []).join(", "));
    setCustomIngredients((item.customIngredients || []).join(", "));
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    Alert.alert("Delete item", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMenuItem(id);
            setItems((prev) => prev.filter((item) => item.id !== id));
            if (editingId === id) {
              resetForm();
            }
          } catch (err) {
            console.log("Delete failed", err);
            Alert.alert("Error", "Could not delete item.");
          }
        },
      },
    ]);
  };

  const buttonLabel = useMemo(() => {
    if (saving) return "Saving...";
    return editingId ? "Update Item" : "Add Item";
  }, [saving, editingId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <TopNav />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Manage Food Items</Text>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{editingId ? "Edit Item" : "Add New Item"}</Text>
            <Pressable style={styles.imagePicker} onPress={handlePickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              ) : (
                <Text style={styles.imagePickerText}>Tap to add image</Text>
              )}
            </Pressable>
            <Text style={styles.label}>Name *</Text>
            <TextInput 
              value={name} 
              onChangeText={(text) => {
                setName(text);
                if (errors.name && text.trim()) setErrors((prev) => ({ ...prev, name: undefined }));
              }} 
              style={[styles.input, errors.name && styles.inputError]} 
              placeholder="Item name" 
              editable={!saving} 
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            <Text style={styles.label}>Price *</Text>
            <TextInput 
              value={price} 
              onChangeText={(text) => {
                setPrice(text);
                if (errors.price && text.trim()) setErrors((prev) => ({ ...prev, price: undefined }));
              }} 
              style={[styles.input, errors.price && styles.inputError]} 
              placeholder="0.00" 
              keyboardType="decimal-pad" 
              editable={!saving} 
            />
            {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
            <Text style={styles.label}>Description</Text>
            <TextInput value={description} onChangeText={setDescription} style={styles.inputMultiline} placeholder="Short description of the item" multiline numberOfLines={3} editable={!saving} />
            <Text style={styles.label}>Long Description</Text>
            <TextInput value={longDescription} onChangeText={setLongDescription} style={styles.inputMultiline} placeholder="Longer, detailed description" multiline numberOfLines={5} editable={!saving} />

            <Text style={styles.sectionTitle}>Food Type</Text>
            <FoodTypeSlider activeCategory={foodType as any} onCategoryChange={(c) => setFoodType(c)} />

            <Text style={styles.sectionTitle}>Nutritional Info</Text>
            <View style={styles.row}>
              <View style={styles.inputQuarter}>
                <Text style={styles.label}>Calories</Text>
                <TextInput value={calories} onChangeText={setCalories} style={styles.input} placeholder="e.g., 450" keyboardType="number-pad" editable={!saving} />
              </View>
              <View style={styles.inputQuarter}>
                <Text style={styles.label}>Protein (g)</Text>
                <TextInput value={protein} onChangeText={setProtein} style={styles.input} placeholder="e.g., 30" keyboardType="number-pad" editable={!saving} />
              </View>
              <View style={styles.inputQuarter}>
                <Text style={styles.label}>Carbs (g)</Text>
                <TextInput value={carbs} onChangeText={setCarbs} style={styles.input} placeholder="e.g., 20" keyboardType="number-pad" editable={!saving} />
              </View>
              <View style={styles.inputQuarter}>
                <Text style={styles.label}>Fat (g)</Text>
                <TextInput value={fat} onChangeText={setFat} style={styles.input} placeholder="e.g., 15" keyboardType="number-pad" editable={!saving} />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Allergens</Text>
            <Text style={styles.help}>Comma-separated (e.g., Fish, Nuts, Dairy)</Text>
            <TextInput value={allergens} onChangeText={setAllergens} style={styles.input} placeholder="Fish, Nuts" editable={!saving} />

            <Text style={styles.sectionTitle}>Sides</Text>
            <Text style={styles.help}>Comma-separated (shown as selectable options)</Text>
            <TextInput value={sides} onChangeText={setSides} style={styles.input} placeholder="Fries, Garden Salad, Coleslaw" editable={!saving} />

            <Text style={styles.sectionTitle}>Drinks</Text>
            <Text style={styles.help}>Comma-separated (with optional price in parentheses)</Text>
            <TextInput value={drinks} onChangeText={setDrinks} style={styles.input} placeholder="Water(0), Coke(0), Juice(2.99)" editable={!saving} />

            <Text style={styles.sectionTitle}>Extras</Text>
            <Text style={styles.help}>Comma-separated (with price, e.g., Extra Salmon(8.99))</Text>
            <TextInput value={extras} onChangeText={setExtras} style={styles.input} placeholder="Extra Salmon(8.99), Herb Butter(1.99)" editable={!saving} />

            <Text style={styles.sectionTitle}>Custom Ingredients</Text>
            <Text style={styles.help}>Comma-separated (e.g., No Lemon, Extra Herbs)</Text>
            <TextInput value={customIngredients} onChangeText={setCustomIngredients} style={styles.input} placeholder="No Lemon, Extra Herbs" editable={!saving} />
            <PrimaryButton title={buttonLabel} onPress={handleSave} disabled={saving} />
            {/* Allow canceling edit state without saving */}
            {editingId ? (
              <Pressable onPress={resetForm} style={styles.cancelEditBtn}>
                <Text style={styles.cancelEditText}>Cancel editing</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Existing Items</Text>
            {items.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>R{item.price?.toFixed ? item.price.toFixed(2) : item.price}</Text>
                </View>
                <Pressable style={styles.editBtn} onPress={() => handleEdit(item)}>
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            ))}
            {items.length === 0 && !loading ? <Text style={styles.empty}>No items yet.</Text> : null}
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
  inputError: { borderColor: "#EF4444", borderWidth: 2 },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: -6, marginBottom: 4 },
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
  cancelEditBtn: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6 },
  cancelEditText: { color: "#6B7280", fontWeight: "700" },
  empty: { color: "#6B7280" },
  imagePicker: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    marginBottom: 10,
    overflow: "hidden",
  },
  imagePickerText: { color: "#6B7280", fontWeight: "700" },
  imagePreview: { width: "100%", height: "100%" },
});
