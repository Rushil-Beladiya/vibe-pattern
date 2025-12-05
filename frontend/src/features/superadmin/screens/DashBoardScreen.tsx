import { useAuth } from "@/src/context/AuthContext";
import { colors } from "@/src/theme";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashBoardScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Super Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome, {user?.name}</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/(superadmin)/screenmanagement")}
        >
          <Text style={styles.cardIcon}>📱</Text>
          <Text style={styles.cardTitle}>Screen Management</Text>
          <Text style={styles.cardDescription}>
            Create and manage dynamic screens for your app
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/(superadmin)/formmanagement")}
        >
          <Text style={styles.cardIcon}>📋</Text>
          <Text style={styles.cardTitle}>Form Management</Text>
          <Text style={styles.cardDescription}>
            Create and manage dynamic forms with custom fields
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.logoutCard]}
          onPress={handleLogout}
        >
          <Text style={styles.cardIcon}>🚪</Text>
          <Text style={styles.cardTitle}>Logout</Text>
          <Text style={styles.cardDescription}>Sign out from your account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  logoutCard: {
    borderWidth: 2,
    borderColor: "#ef4444",
  },
});
