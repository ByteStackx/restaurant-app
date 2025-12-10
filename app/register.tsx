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

// Validation helpers
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, "");
  return cleaned.length >= 10;
}

function isValidCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, "");
  return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned);
}

function isValidCardExpiry(expiry: string): boolean {
  return /^\d{2}\/\d{2}$/.test(expiry);
}

function isValidCardCvv(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

function isValidZipCode(zipCode: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zipCode);
}

export default function Register() {
  const router = useRouter();
  const { signup, error, clearError } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (!isValidPassword(password)) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!phone.trim()) {
      errors.phone = "Contact number is required";
    } else if (!isValidPhone(phone)) {
      errors.phone = "Please enter a valid contact number";
    }

    if (!addressLine1.trim()) {
      errors.addressLine1 = "Address is required";
    } else if (addressLine1.trim().length < 5) {
      errors.addressLine1 = "Please enter a valid address";
    }

    if (!city.trim()) {
      errors.city = "City is required";
    } else if (city.trim().length < 2) {
      errors.city = "City must be at least 2 characters";
    }

    if (!state.trim()) {
      errors.state = "State/Province is required";
    }

    if (!zipCode.trim()) {
      errors.zipCode = "ZIP code is required";
    } else if (!isValidZipCode(zipCode)) {
      errors.zipCode = "Please enter a valid ZIP code (e.g., 12345)";
    }

    if (!cardName.trim()) {
      errors.cardName = "Cardholder name is required";
    } else if (cardName.trim().length < 3) {
      errors.cardName = "Cardholder name must be at least 3 characters";
    }

    if (!cardNumber.trim()) {
      errors.cardNumber = "Card number is required";
    } else if (!isValidCardNumber(cardNumber)) {
      errors.cardNumber = "Please enter a valid card number";
    }

    if (!cardExpiry.trim()) {
      errors.cardExpiry = "Expiry date is required";
    } else if (!isValidCardExpiry(cardExpiry)) {
      errors.cardExpiry = "Please enter expiry date in MM/YY format";
    }

    if (!cardCvv.trim()) {
      errors.cardCvv = "CVV is required";
    } else if (!isValidCardCvv(cardCvv)) {
      errors.cardCvv = "Please enter a valid CVV (3-4 digits)";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      clearError();
      await signup(email, password, {
        firstName,
        lastName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode,
        cardNumber,
        cardExpiry,
        cardCvv,
        cardName,
      });
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
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <AuthInput
                  label="First Name"
                  placeholder="Alex"
                  autoCapitalize="words"
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    if (validationErrors.firstName) {
                      setValidationErrors((prev) => {
                        const updated = { ...prev };
                        delete updated.firstName;
                        return updated;
                      });
                    }
                  }}
                />
                {validationErrors.firstName && (
                  <Text style={styles.fieldError}>{validationErrors.firstName}</Text>
                )}
              </View>
              <View style={styles.inputHalf}>
                <AuthInput
                  label="Last Name"
                  placeholder="Doe"
                  autoCapitalize="words"
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    if (validationErrors.lastName) {
                      setValidationErrors((prev) => {
                        const updated = { ...prev };
                        delete updated.lastName;
                        return updated;
                      });
                    }
                  }}
                />
                {validationErrors.lastName && (
                  <Text style={styles.fieldError}>{validationErrors.lastName}</Text>
                )}
              </View>
            </View>
            <AuthInput
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (validationErrors.email) {
                  setValidationErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.email;
                    return updated;
                  });
                }
              }}
            />
            {validationErrors.email && (
              <Text style={styles.fieldError}>{validationErrors.email}</Text>
            )}
            <AuthInput
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (validationErrors.password) {
                  setValidationErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.password;
                    return updated;
                  });
                }
              }}
            />
            {validationErrors.password && (
              <Text style={styles.fieldError}>{validationErrors.password}</Text>
            )}
            <AuthInput
              label="Contact Number"
              placeholder="+27 123 456 7890"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (validationErrors.phone) {
                  setValidationErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.phone;
                    return updated;
                  });
                }
              }}
            />
            {validationErrors.phone && (
              <Text style={styles.fieldError}>{validationErrors.phone}</Text>
            )}

            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <AuthInput
              label="Address Line 1"
              placeholder="123 Main Street"
              value={addressLine1}
              onChangeText={(text) => {
                setAddressLine1(text);
                if (validationErrors.addressLine1) {
                  setValidationErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.addressLine1;
                    return updated;
                  });
                }
              }}
            />
            {validationErrors.addressLine1 && (
              <Text style={styles.fieldError}>{validationErrors.addressLine1}</Text>
            )}
            <AuthInput
              label="Address Line 2 (Optional)"
              placeholder="Apt 4B"
              value={addressLine2}
              onChangeText={setAddressLine2}
            />
            <View style={styles.inputRow}>
              <View style={styles.inputCity}>
                <AuthInput
                  label="City"
                  placeholder="San Francisco"
                  value={city}
                  onChangeText={(text) => {
                    setCity(text);
                    if (validationErrors.city) {
                      setValidationErrors((prev) => {
                        const updated = { ...prev };
                        delete updated.city;
                        return updated;
                      });
                    }
                  }}
                />
                {validationErrors.city && (
                  <Text style={styles.fieldError}>{validationErrors.city}</Text>
                )}
              </View>
              <View style={styles.inputState}>
                <AuthInput
                  label="State/Province"
                  placeholder=""
                  autoCapitalize="characters"
                  maxLength={2}
                  value={state}
                  onChangeText={(text) => {
                    setState(text);
                    if (validationErrors.state) {
                      setValidationErrors((prev) => {
                        const updated = { ...prev };
                        delete updated.state;
                        return updated;
                      });
                    }
                  }}
                />
                {validationErrors.state && (
                  <Text style={styles.fieldError}>{validationErrors.state}</Text>
                )}
              </View>
              <View style={styles.inputZip}>
                <AuthInput
                  label="ZIP"
                  placeholder="94103"
                  keyboardType="number-pad"
                  maxLength={5}
                  value={zipCode}
                  onChangeText={(text) => {
                    setZipCode(text);
                    if (validationErrors.zipCode) {
                      setValidationErrors((prev) => {
                        const updated = { ...prev };
                        delete updated.zipCode;
                        return updated;
                      });
                    }
                  }}
                />
                {validationErrors.zipCode && (
                  <Text style={styles.fieldError}>{validationErrors.zipCode}</Text>
                )}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Payment Information</Text>
            <AuthInput
              label="Cardholder Name"
              placeholder="Alex Doe"
              autoCapitalize="words"
              value={cardName}
              onChangeText={(text) => {
                setCardName(text);
                if (validationErrors.cardName) {
                  setValidationErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.cardName;
                    return updated;
                  });
                }
              }}
            />
            {validationErrors.cardName && (
              <Text style={styles.fieldError}>{validationErrors.cardName}</Text>
            )}
            <AuthInput
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              keyboardType="number-pad"
              maxLength={19}
              value={cardNumber}
              onChangeText={(text) => {
                setCardNumber(text);
                if (validationErrors.cardNumber) {
                  setValidationErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.cardNumber;
                    return updated;
                  });
                }
              }}
            />
            {validationErrors.cardNumber && (
              <Text style={styles.fieldError}>{validationErrors.cardNumber}</Text>
            )}
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <AuthInput
                  label="Expiry Date"
                  placeholder="MM/YY"
                  keyboardType="number-pad"
                  maxLength={5}
                  value={cardExpiry}
                  onChangeText={(text) => {
                    setCardExpiry(text);
                    if (validationErrors.cardExpiry) {
                      setValidationErrors((prev) => {
                        const updated = { ...prev };
                        delete updated.cardExpiry;
                        return updated;
                      });
                    }
                  }}
                />
                {validationErrors.cardExpiry && (
                  <Text style={styles.fieldError}>{validationErrors.cardExpiry}</Text>
                )}
              </View>
              <View style={styles.inputHalf}>
                <AuthInput
                  label="CVV"
                  placeholder="123"
                  keyboardType="number-pad"
                  maxLength={3}
                  secureTextEntry
                  value={cardCvv}
                  onChangeText={(text) => {
                    setCardCvv(text);
                    if (validationErrors.cardCvv) {
                      setValidationErrors((prev) => {
                        const updated = { ...prev };
                        delete updated.cardCvv;
                        return updated;
                      });
                    }
                  }}
                />
                {validationErrors.cardCvv && (
                  <Text style={styles.fieldError}>{validationErrors.cardCvv}</Text>
                )}
              </View>
            </View>

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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginTop: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  inputCity: {
    flex: 2,
  },
  inputState: {
    flex: 1,
  },
  inputZip: {
    flex: 1,
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
  fieldError: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
});
