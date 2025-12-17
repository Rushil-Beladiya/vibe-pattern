import { Button } from "@/src/components/Button";
import CustomHeader from "@/src/components/CustomHeader";
import { useToast, useUser } from "@/src/context";
import { sendRequest } from "@/src/lib/api";
import { colors } from "@/src/theme/colors";
import { setStoreValue } from "@/src/utils/storage";
import { router } from "expo-router";
import React, { FC, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface LoginScreenProps {}

export const LoginScreen: FC<LoginScreenProps> = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { setUser } = useUser();
  const { showToast } = useToast();

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email");
      return;
    }

    if (!password.trim()) {
      setPasswordError("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await sendRequest({
        url: "login",
        method: "post",
        data: {
          email: email.trim(),
          password,
        },
      });

      if (response.success && response.data) {
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role_id: response.data.user.role_id,
          access_token: response.data.token,
        };

        await setStoreValue({ key: "user", value: userData });
        await setStoreValue({ key: "token", value: response.data.token });

        setUser(userData);

        const roleId = Number(userData.role_id);

        if (roleId === 1) {
          router.replace("/(superadmin)/dashboard");
        } else {
          router.replace("/(drawer)/(tabs)/music");
        }

        showToast({
          message: response.message || "Login Successful",
          type: "success",
        });
      } else {
        showToast({
          message: response.message || "Login failed",
          type: "error",
        });
      }
    } catch (e: any) {
      showToast({
        message: e?.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <CustomHeader title="Login" hideLeftButton />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>

            <TextInput
              placeholder="Enter Your Email"
              style={[styles.input, emailError && styles.inputError]}
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>

            <TextInput
              placeholder="Enter your password"
              style={[styles.input, passwordError && styles.inputError]}
              placeholderTextColor={colors.textLight}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>

          <Button
            type="primary"
            onPress={handleLogin}
            loading={isLoading}
            title="Login"
            style={{ alignSelf: "center" }}
          />

          <View style={styles.row}>
            <Text style={styles.small}>Don't have an account?</Text>

            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.link}> Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: colors.background,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  inputGroup: {
    marginBottom: 15,
  },

  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    color: colors.text,
  },

  inputError: {
    borderColor: colors.error,
  },

  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  row: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  small: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  link: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
});
