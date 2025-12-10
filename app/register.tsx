import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { AuthInput } from "./components/AuthInput";
import { PrimaryButton } from "./components/PrimaryButton";
import { useAuth } from "./lib/auth-context";

export default function Register() {
  const router = useRouter();
  const { signup, error, clearError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name) {
      return;
    }
    try {
      setIsLoading(true);
      clearError();
      await signup(email, password, name);
      router.push("/home");
    } catch (_err) {
      // Error is handled in AuthContext and available via 'error'
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Join the community</Text>
            <Text style={styles.subtitle}>
              Create an account to save favorites, earn rewards, and check out
              faster.
            </Text>
          </View>

          <View style={styles.form}>
            <AuthInput
              label="Full Name"
              placeholder="Alex Doe"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
            <AuthInput
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <AuthInput
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <PrimaryButton
              title="Create Account"
              onPress={handleRegister}
              disabled={isLoading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already a member?</Text>
            <Link href="/login" style={styles.link}>
              Log in
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    gap: 20,
    shadowColor: "#111827",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
  },
  form: {
    gap: 14,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    color: "#6B7280",
  },
  link: {
    color: "#111827",
    fontWeight: "700",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
});
