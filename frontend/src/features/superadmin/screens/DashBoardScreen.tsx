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

type Field = {
  key: string;
  label: string;
  type: string;
  options: string[];
};

type Form = {
  id: number;
  name: string;
  screen: string;
  fields: Field[];
  created_at: string;
  updated_at: string;
  submissions_count: number;
};

export default function DashBoardScreen() {
  const [forms, setForms] = useState<Form[]>([]);

  useLayoutEffect(() => {
    fetchAllForms();
  }, []);

  const handleAddPress = () => {
    router.push("/(superadmin)/formcreateupdate");
  };

  const fetchAllForms = async () => {
    try {
      const response = await sendRequest({
        url: api.getallForms(),
        method: "get",
      });

      if (response.success && response.data) {
        setForms(response.data as Form[]);
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
    }
  };

  const renderField = (field: Field, index: number) => (
    <View key={index} style={styles.fieldBox}>
      <Text style={styles.fieldText}>
        <Text style={styles.bold}>Label :</Text> {field.label}
      </Text>

      <Text style={styles.fieldText}>
        <Text style={styles.bold}>Type :</Text> {field.type}
      </Text>

      {field.options?.length > 0 && (
        <Text style={styles.fieldText}>
          <Text style={styles.bold}>Options :</Text> {field.options.join(", ")}
        </Text>
      )}
    </View>
  );

  const renderForm = ({ item }: { item: Form }) => (
    <View style={styles.card}>
      <Text style={styles.formTitle}>{item.name}</Text>

      <Text style={styles.meta}>Screen : {item.screen}</Text>
      <Text style={styles.meta}>Submissions : {item.submissions_count}</Text>

      <Text style={styles.section}>Fields</Text>

      {item.fields.map(renderField)}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <RefreshControl refreshing={false} onRefresh={fetchAllForms} />
      <Text style={styles.header}>Form Templates</Text>

      <FlatList<Form>
        data={forms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderForm}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
  },
  header: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#461053",
  },
  meta: {
    fontSize: 13,
    color: "#444",
  },
  section: {
    marginTop: 8,
    fontWeight: "600",
  },
  fieldBox: {
    padding: 8,
    marginTop: 6,
    backgroundColor: "#F0E9F7",
    borderRadius: 6,
  },
  fieldText: {
    fontSize: 13,
  },
  bold: {
    fontWeight: "600",
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
});
