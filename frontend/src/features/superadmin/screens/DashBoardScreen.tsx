import CustomHeader from "@/src/components/CustomHeader";
import { api, sendRequest } from "@/src/lib/api";
import { router } from "expo-router";
import React, { useLayoutEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
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

export default function DashBoardScreen() {
  const [forms, setForms] = useState<Form[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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
    } catch (e) {
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
    } catch (error) {
      console.error("Error fetching forms:", error);
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
    } catch (e) {
      // fallback to simple push
      router.push(
        `/(superadmin)/formview?form=${encodeURIComponent(
          JSON.stringify(form)
        )}`
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title="Form Dashboard" useCustomDrawer />

      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.screenBtn}
            onPress={handleScreensPress}
          >
            <Text style={styles.screenBtnText}>Manage Screens</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={forms}
          keyExtractor={(item) => String(item.id)}
          refreshing={refreshing}
          onRefresh={onRefresh}
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
            <View style={{ padding: 20 }}>
              <Text style={{ textAlign: "center", color: "#666" }}>
                No forms available
              </Text>
            </View>
          )}
        />

        <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
  },
  headerRow: {
    marginBottom: 12,
  },
  screenBtn: {
    backgroundColor: "#461053",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  screenBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#461053",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabIcon: {
    fontSize: 32,
    color: "#fff",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLeft: { flex: 1 },
  cardActions: { marginLeft: 8 },
  cardActionBtn: {
    backgroundColor: "#e8d4f0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  cardActionText: { color: "#461053", fontWeight: "600", fontSize: 12 },
  title: { fontSize: 16, fontWeight: "600" },
  subtitle: { color: "#666", marginTop: 4 },
  meta: { color: "#999", marginTop: 6, fontSize: 12 },
});
