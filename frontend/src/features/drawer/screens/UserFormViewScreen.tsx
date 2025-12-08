import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import formService, { Form } from "@/src/services/formService";
import { colors } from "@/src/theme";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserFormViewScreen() {
  const params = useLocalSearchParams();
  const formId = Number(params.formId);
  const formName = params.formName as string;

  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      setIsLoading(true);
      const data = await formService.getFormById(formId);
      setForm(data);
    } catch (error: any) {
      showToast({
        message: error.response?.data?.message || "Failed to fetch form",
        type: "error",
      });
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const renderFieldValue = (field: any) => {
    const value = field.value;

    if (!value) {
      return <Text style={styles.fieldValue}>No data</Text>;
    }

    switch (field.type) {
      case "image":
        return (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: value }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        );

      case "file":
        return (
          <TouchableOpacity style={styles.fileButton}>
            <Text style={styles.fileButtonText}>📄 View File</Text>
          </TouchableOpacity>
        );

      case "checkbox":
        return (
          <View style={styles.checkboxContainer}>
            {Array.isArray(value) ? (
              value.map((option, idx) => (
                <View key={idx} style={styles.checkboxItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.checkboxText}>{option}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.fieldValue}>{value}</Text>
            )}
          </View>
        );

      case "textarea":
        return <Text style={styles.fieldValueMultiline}>{value}</Text>;

      default:
        return <Text style={styles.fieldValue}>{value}</Text>;
    }
  };

  const renderField = (field: any, index: number) => (
    <View key={index} style={styles.fieldCard}>
      <Text style={styles.fieldLabel}>{field.label}</Text>
      <Text style={styles.fieldType}>Type: {field.type}</Text>
      {renderFieldValue(field)}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading form...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!form) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Form not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>{formName}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>📖 Read-Only View</Text>
        </View>

        {form.fields && form.fields.length > 0 ? (
          form.fields.map((field, index) => renderField(field, index))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        )}
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  infoBox: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  fieldCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  fieldType: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: colors.text,
    marginTop: 4,
  },
  fieldValueMultiline: {
    fontSize: 16,
    color: colors.text,
    marginTop: 4,
    lineHeight: 24,
  },
  imageContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
    backgroundColor: colors.border,
  },
  fileButton: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  fileButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  checkboxContainer: {
    marginTop: 8,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 6,
  },
  checkmark: {
    fontSize: 18,
    color: "#10b981",
    marginRight: 8,
  },
  checkboxText: {
    fontSize: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
