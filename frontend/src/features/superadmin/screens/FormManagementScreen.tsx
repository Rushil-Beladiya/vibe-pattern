import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import formService, { Form } from "@/src/services/formService";
import { colors } from "@/src/theme";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FormManagementScreen() {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setIsLoading(true);
      const data = await formService.getAllForms();
      setForms(data);
    } catch (error: any) {
      showToast({
        message: error.response?.data?.message || "Failed to fetch forms",
        type: "error",
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchForms();
  };

  const handleCreateForm = () => {
    router.push("/(superadmin)/formbuilder");
  };

  const handleEditForm = (form: Form) => {
    router.push({
      pathname: "/(superadmin)/formbuilder",
      params: { formId: form.id },
    });
  };

  const handleDeleteForm = (form: Form) => {
    Alert.alert(
      "Delete Form",
      `Are you sure you want to delete "${form.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await formService.deleteForm(form.id);
              showToast({
                message: "Form deleted successfully",
                type: "success",
              });
              fetchForms();
            } catch (error: any) {
              showToast({
                message:
                  error.response?.data?.message || "Failed to delete form",
                type: "error",
              });
            }
          },
        },
      ]
    );
  };

  const renderFieldType = (type: string) => {
    const typeColors: any = {
      text: "#3b82f6",
      textarea: "#8b5cf6",
      select: "#10b981",
      checkbox: "#f59e0b",
      date: "#ef4444",
      image: "#ec4899",
      file: "#6366f1",
    };

    return (
      <View
        style={[
          styles.fieldTypeBadge,
          { backgroundColor: typeColors[type] || "#6b7280" },
        ]}
      >
        <Text style={styles.fieldTypeText}>{type}</Text>
      </View>
    );
  };

  const renderForm = ({ item }: { item: Form }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.formName}>{item.name}</Text>
          <Text style={styles.formMeta}>Screen: {item.screen?.name}</Text>
          <Text style={styles.formMeta}>
            Created: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => handleEditForm(item)}
          >
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDeleteForm(item)}
          >
            <Text style={styles.actionBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {item.fields && item.fields.length > 0 && (
        <View style={styles.fieldsSection}>
          <Text style={styles.fieldsSectionTitle}>
            Fields ({item.fields.length})
          </Text>
          <View style={styles.fieldsContainer}>
            {item.fields.slice(0, 5).map((field, index) => (
              <View key={index} style={styles.fieldItem}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                {renderFieldType(field.type)}
              </View>
            ))}
            {item.fields.length > 5 && (
              <Text style={styles.moreFieldsText}>
                +{item.fields.length - 5} more fields
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading forms...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Form Management</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={forms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderForm}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No forms yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first form to get started
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleCreateForm}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  formName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  formMeta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editBtn: {
    backgroundColor: colors.primary,
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  fieldsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  fieldsSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  fieldsContainer: {
    gap: 8,
  },
  fieldItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 6,
  },
  fieldLabel: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  fieldTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fieldTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  moreFieldsText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
  },
});
