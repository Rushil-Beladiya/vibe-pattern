import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import { useUser } from "@/src/context";
import { AdminHomeScreen } from "@/src/features/tab/screens/home";
import { useLocalSearchParams } from "expo-router";

function AboutScreenContent() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>About Us</Text>
        <View style={styles.card}>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.description}>
            This is a demo app showcasing Expo Router with custom drawer and
            bottom tabs navigation.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default function AboutScreen() {
  const { userRole } = useUser();
  const params = useLocalSearchParams();
  const screen_id = params.screen_id as string;

  return userRole.admin ? (
    <AdminHomeScreen screen_id={screen_id} />
  ) : (
    <AboutScreenContent />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
  },
  version: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
});
