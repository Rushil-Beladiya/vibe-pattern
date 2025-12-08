import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import formService, { Form } from "@/src/services/formService";
import { colors } from "@/src/theme";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AdminFormListScreenProps {
  screenId: number;
  screenName: string;
}

export default function AdminFormListScreen({
  screenId,
  screenName,
}: AdminFormListScreenProps) {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchForms();
  }, [screenId]);

  const fetchForms = async () => {
    try {
      setIsLoading(true);
      const data = await formService.getFormsByScreen(screenId);
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

  const handleFormPress = (form: Form) => {
    router.push({
      pathname: "/(drawer)/formfill",
      params: { formId: form.id, formName: form.name },
    });
  };

  const renderForm = ({ item }: { item: Form }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleFormPress(item)}>
      <View style={styles.cardContent}>
        <Text style={styles.formName}>{item.name}</Text>
        <Text style={styles.formMeta}>{item.fields?.length || 0} fields</Text>
        <Text style={styles.formDescription}>Tap to fill this form</Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>{screenName} Forms</Text>
        <Text style={styles.headerSubtitle}>Select a form to fill</Text>
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
            <Text style={styles.emptyText}>No forms available</Text>
            <Text style={styles.emptySubtext}>
              Forms will appear here once created
            </Text>
          </View>
        }
      />
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
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
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  cardContent: {
    flex: 1,
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
    marginBottom: 4,
  },
  formDescription: {
    fontSize: 12,
    color: colors.primary,
    fontStyle: "italic",
  },
  arrow: {
    fontSize: 24,
    color: colors.primary,
    marginLeft: 12,
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
});
