import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type QuantitySelectorProps = {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
};

export function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed ? styles.pressed : undefined,
          quantity <= min ? styles.disabled : undefined,
        ]}
        onPress={handleDecrement}
        disabled={quantity <= min}
      >
        <Ionicons name="remove" size={20} color="#111827" />
      </Pressable>

      <View style={styles.display}>
        <Text style={styles.quantity}>{quantity}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed ? styles.pressed : undefined,
          quantity >= max ? styles.disabled : undefined,
        ]}
        onPress={handleIncrement}
        disabled={quantity >= max}
      >
        <Ionicons name="add" size={20} color="#111827" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 0,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
  },
  pressed: {
    backgroundColor: "#374151",
  },
  disabled: {
    opacity: 0.5,
  },
  display: {
    justifyContent: "center",
    alignItems: "center",
  },
  quantity: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    minWidth: 30,
    textAlign: "center",
  },
});
