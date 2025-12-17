import CustomHeader from "@/src/components/CustomHeader";
import { sendRequest } from "@/src/lib/api";
import { router } from "expo-router";
import React, { FC, useLayoutEffect, useState } from "react";

import { Text } from "@/src/components/Text";
import { colors } from "@/src/theme/colors";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Screen = {
  id: number;
  name: string;
};

type Field = {
  key: string;
  label: string;
  type: string;
  options: string[];
};

type Form = {
  id: number;
  name: string;
  screen: Screen | string;
  fields: Field[];
  created_at: string;
  updated_at: string;
  submissions_count: number;
  is_active: boolean;
};
export const SuperAdminDashboardScreen: FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading] = useState(false);

  useLayoutEffect(() => {
    fetchAllForms();
  }, []);

  const handleAddPress = () => {
    router.push("/(superadmin)/formcreate");
  };

  const handleScreensPress = () => {
    router.push("/(superadmin)/screens");
  };

  const handleEditForm = (form: Form) => {
    try {
      router.push({
        pathname: "/(superadmin)/formedit",
        params: { form: JSON.stringify(form) },
      });
    } catch {
      router.push(
        `/(superadmin)/formedit?form=${encodeURIComponent(
          JSON.stringify(form)
        )}`
      );
    }
  };

  const fetchAllForms = async () => {
    try {
      const response = await sendRequest({
        url: `super-admin/forms`,
        method: "get",
      });

      if (response.success && response.data) {
        setForms(response.data as Form[]);
        console.log("Fetched forms:", response.data);
      }
    } catch {
      console.error("Error fetching forms:");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllForms();
    setRefreshing(false);
  };

  const handleOpenForm = (form: Form) => {
    // pass the form as a string param to the route
    try {
      router.push({
        pathname: "/(superadmin)/formview",
        params: { form: JSON.stringify(form) },
      });
    } catch {
      // fallback to simple push
      router.push(
        `/(superadmin)/formview?form=${encodeURIComponent(
          JSON.stringify(form)
        )}`
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <CustomHeader title="Form Dashboard" useCustomDrawer />

      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.screenBtn} onPress={handleScreensPress}>
          <Text style={styles.screenBtnText}>Manage Screens</Text>
        </TouchableOpacity>
      </View>

      {loading && forms.length === 0 ? (
        <View style={styles.centerEmpty}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={forms}
          keyExtractor={(item) => String(item.id)}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={
            forms.length === 0 ? styles.listEmpty : styles.list
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => handleOpenForm(item)}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.title}>{item.name}</Text>
                  <Text style={styles.subtitle}>
                    {typeof item.screen === "string"
                      ? item.screen
                      : item.screen?.name}
                  </Text>
                  <Text style={styles.meta}>
                    {item.fields?.length ?? 0} fields •{" "}
                    {item.is_active ? "Active" : "Inactive"}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.cardActionBtn}
                  onPress={() => handleEditForm(item)}
                >
                  <Text style={styles.cardActionText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No forms available</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddPress}
        accessibilityRole="button"
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: "flex-end",
  },
  screenBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  screenBtnText: {
    color: colors.white,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  centerEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.divider,
    // subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLeft: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  meta: {
    fontSize: 12,
    color: colors.textLight,
  },
  cardActions: {
    marginLeft: 12,
  },
  cardActionBtn: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  cardActionText: {
    color: colors.white,
    fontWeight: "600",
  },
  emptyWrap: {
    padding: 20,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
  },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 28,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: {
    color: colors.white,
    fontSize: 28,
    lineHeight: 30,
  },
});
