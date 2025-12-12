import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export type MenuItemCardProps = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  onAddToCart?: (itemId: string) => void;
  onPress?: (itemId: string) => void;
};

export function MenuItemCard({
  id,
  name,
  description,
  price,
  imageUrl,
  onAddToCart,
  onPress,
}: MenuItemCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress?.(id)}
    >
      {/* Image Left */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={32} color="#D1D5DB" />
          </View>
        )}
      </View>

      {/* Content Right */}
      <View style={styles.contentContainer}>
        <View style={styles.textContent}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
          <Text style={styles.price}>${price.toFixed(2)}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.pressed,
          ]}
          onPress={() => onAddToCart?.(id)}
        >
          <Ionicons name="add-circle" size={28} color="#111827" />
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    overflow: "hidden",
    marginHorizontal: 20,
    marginVertical: 10,
  },
  cardPressed: {
    opacity: 0.9,
  },
  imageContainer: {
    width: "45%",
    aspectRatio: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  textContent: {
    gap: 6,
    width: "100%",
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  description: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  addButton: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
});
