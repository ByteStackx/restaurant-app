import { Pressable, StyleSheet, Text, View } from "react-native";

type RadioOption = {
  id: string;
  label: string;
  description?: string;
  priceModifier?: number;
};

type RadioGroupProps = {
  options: RadioOption[];
  selected?: string;
  onSelect: (id: string) => void;
  maxSelections?: number;
};

export function RadioGroup({ options, selected, onSelect }: RadioGroupProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selected === option.id;
        return (
          <Pressable
            key={option.id}
            style={({ pressed }) => [
              styles.option,
              isSelected ? styles.selectedOption : undefined,
              pressed ? styles.pressed : undefined,
            ]}
            onPress={() => onSelect(option.id)}
          >
            <View style={styles.radio}>
              {isSelected && <View style={styles.radioDot} />}
            </View>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>{option.label}</Text>
              {option.description && (
                <Text style={styles.description}>{option.description}</Text>
              )}
            </View>
            {option.priceModifier !== undefined && option.priceModifier > 0 && (
              <Text style={styles.price}>+${option.priceModifier.toFixed(2)}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedOption: {
    backgroundColor: "#F0F9FF",
    borderColor: "#111827",
  },
  pressed: {
    opacity: 0.8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#111827",
  },
  labelContainer: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  description: {
    fontSize: 12,
    color: "#6B7280",
  },
  price: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 8,
  },
});
