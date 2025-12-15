import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type CheckboxOption = {
  id: string;
  label: string;
  description?: string;
  price?: number;
};

type CheckboxGroupProps = {
  options: CheckboxOption[];
  selected?: string[];
  onSelect: (ids: string[]) => void;
  maxSelections?: number;
  minSelections?: number;
  mode?: "single" | "multiple";
};

export function CheckboxGroup({
  options,
  selected = [],
  onSelect,
  maxSelections,
  minSelections,
  mode = "multiple",
}: CheckboxGroupProps) {
  const handleToggle = (id: string) => {
    let newSelected: string[];

    if (mode === "single") {
      newSelected = selected.includes(id) ? [] : [id];
    } else {
      if (selected.includes(id)) {
        newSelected = selected.filter((s) => s !== id);
      } else {
        if (maxSelections && selected.length >= maxSelections) {
          return;
        }
        newSelected = [...selected, id];
      }
    }

    if (minSelections && newSelected.length < minSelections) {
      return;
    }

    onSelect(newSelected);
  };

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        const isDisabled = maxSelections && selected.length >= maxSelections && !isSelected;

        return (
          <Pressable
            key={option.id}
            style={({ pressed }) => [
              styles.option,
              isSelected ? styles.selectedOption : undefined,
              isDisabled ? styles.disabledOption : undefined,
              pressed && !isDisabled ? styles.pressed : undefined,
            ]}
            onPress={() => !isDisabled && handleToggle(option.id)}
            disabled={isDisabled || false}
          >
            <View
              style={[
                styles.checkbox,
                isSelected ? styles.checkedCheckbox : undefined,
                isDisabled ? styles.disabledCheckbox : undefined,
              ]}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.labelContainer}>
              <Text style={[styles.label, isDisabled ? styles.disabledLabel : undefined]}>
                {option.label}
              </Text>
              {option.description && (
                <Text style={[styles.description, isDisabled ? styles.disabledDescription : undefined]}>
                  {option.description}
                </Text>
              )}
            </View>
            {option.price !== undefined && option.price > 0 && (
              <Text style={[styles.price, isDisabled ? styles.disabledPrice : undefined]}>
                +R{option.price.toFixed(2)}
              </Text>
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
  disabledOption: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkedCheckbox: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  disabledCheckbox: {
    borderColor: "#D1D5DB",
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
  disabledLabel: {
    color: "#9CA3AF",
  },
  description: {
    fontSize: 12,
    color: "#6B7280",
  },
  disabledDescription: {
    color: "#D1D5DB",
  },
  price: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 8,
  },
  disabledPrice: {
    color: "#9CA3AF",
  },
});
