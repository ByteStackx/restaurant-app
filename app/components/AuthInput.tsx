import { forwardRef } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

type AuthInputProps = {
  label?: string;
} & TextInputProps;

export const AuthInput = forwardRef<TextInput, AuthInputProps>(
  ({ label, style, ...textInputProps }, ref) => {
    return (
      <View style={styles.container}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <TextInput
          ref={ref}
          placeholderTextColor="#9CA3AF"
          style={[styles.input, style]}
          {...textInputProps}
        />
      </View>
    );
  }
);

AuthInput.displayName = "AuthInput";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 8,
  },
  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#111827",
  },
});
