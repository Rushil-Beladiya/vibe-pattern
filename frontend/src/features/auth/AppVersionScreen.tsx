import CustomHeader from "@/src/components/CustomHeader";
import Constants from "expo-constants";
import React, { FC } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useToast } from "../../context/ToastContext";
import { colors } from "../../theme/colors";

export const AppVersionScreen: FC = () => {
  const { showToast } = useToast();

  const version =
    (Constants as any)?.expoConfig?.version ||
    (Constants as any)?.manifest?.version ||
    "1.0.0";

  const handleUpdateNow = () => {
    // Placeholder behaviour: show a toast. Integrate OTA/update logic as needed.
    showToast({ message: "Checking for updates...", type: "info" });
    setTimeout(() => {
      showToast({ message: "You are on the latest version.", type: "success" });
    }, 1200);
  };

  return (
    <View style={styles.screen}>
      <CustomHeader title="App Version" hideLeftButton />

      <View style={styles.content}>
        <Text style={styles.title}>App Version</Text>
        <Text style={styles.versionText}>v{version}</Text>

        <Text style={styles.note}>
          This is the currently installed app version. Tap the button below to
          check for updates.
        </Text>

        <TouchableOpacity style={styles.updateBtn} onPress={handleUpdateNow}>
          <Text style={styles.updateBtnText}>Update Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginTop: 12,
  },
  versionText: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 8,
  },
  note: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 20,
  },
  updateBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  updateBtnText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: "600",
  },
});
