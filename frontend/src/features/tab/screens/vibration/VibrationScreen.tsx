import React, { FC, useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Button,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
} from "react-native";
import {
  fetchVibrationData,
  type VibrationData,
} from "@/src/services/vibrationService";
import { sendRequest } from "@/src/lib/api";
import { colors, spacing, typography } from "@/src/theme";

interface VibrationScreenProps {
  screen_id?: string;
}

type Field = {
  key: string;
  label: string;
  type: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  value?: any;
};

type FormData = {
  id: number;
  name: string;
  screen: any;
  fields: Field[];
};

export const VibrationScreen: FC<VibrationScreenProps> = ({ screen_id }) => {
  const [data, setData] = useState<VibrationData | null>(null);
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldValues, setFieldValues] = useState<{ [key: string]: any }>({});

  const loadData = useCallback(async () => {
    if (!screen_id) {
      setError("No screen_id provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try to fetch form data first
      console.log(`📥 Fetching form for vibration screen ${screen_id}`);
      const formResponse = await sendRequest({
        url: `admin/forms/${screen_id}`,
        method: "get",
      });

      if (formResponse.success && formResponse.data) {
        console.log("✅ Form data loaded:", formResponse.data);
        setForm(formResponse.data as FormData);
        // Initialize field values
        const values: { [key: string]: any } = {};
        formResponse.data.fields?.forEach((field: Field) => {
          values[field.key] = field.value ?? "";
        });
        setFieldValues(values);
      } else {
        // If no form, try to load vibration data
        const fetchedData = await fetchVibrationData(screen_id);
        if (fetchedData) {
          setData(fetchedData);
        }
      }
    } catch (err) {
      console.error("❌ VibrationScreen error:", err);
      setError("Failed to load screen data");
    } finally {
      setLoading(false);
    }
  }, [screen_id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleFieldChange = (key: string, value: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form) return;

    // Validate required fields
    const errors: string[] = [];
    form.fields.forEach((field) => {
      if (
        field.required &&
        (!fieldValues[field.key] || fieldValues[field.key] === "")
      ) {
        errors.push(`${field.label} is required`);
      }
    });

    if (errors.length > 0) {
      Alert.alert("Validation Error", errors.join("\n"));
      return;
    }

    setSubmitting(true);

    try {
      const submitFields = form.fields.map((field) => ({
        ...field,
        value: fieldValues[field.key],
      }));

      const payload = {
        fields: submitFields,
      };

      console.log("📤 Submitting form from vibration screen:", payload);

      const response = await sendRequest({
        url: `admin/forms/${form.id}/store`,
        method: "post",
        data: payload,
      });

      console.log("✅ Form submission response:", response);

      if (response.success) {
        Alert.alert("Success", "Form submitted successfully", [
          {
            text: "OK",
            onPress: () => {
              setFieldValues({});
              loadData();
            },
          },
        ]);
      } else {
        Alert.alert("Error", response.message || "Failed to submit form");
      }
    } catch (err) {
      console.error("❌ Form submission error:", err);
      Alert.alert("Error", "An error occurred while submitting the form");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <Text style={styles.debugText}>Screen ID: {screen_id}</Text>
        <Button title="Retry" onPress={loadData} color={colors.primary} />
      </View>
    );
  }

  // Render Form if available
  if (form && form.fields && form.fields.length > 0) {
    return (
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>{form.name}</Text>
          <Text style={styles.formSubtitle}>{form.screen?.name ?? ""}</Text>

          <View style={{ marginTop: 16 }}>
            {form.fields.map((field) => (
              <View style={styles.fieldRow} key={field.key}>
                <Text style={styles.fieldLabel}>
                  {field.label}
                  {field.required ? " *" : ""}
                </Text>

                {field.type === "text" && (
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder ?? "Enter " + field.label}
                    value={fieldValues[field.key] ?? ""}
                    onChangeText={(value) =>
                      handleFieldChange(field.key, value)
                    }
                  />
                )}

                {field.type === "textarea" && (
                  <TextInput
                    style={[styles.input, { minHeight: 100 }]}
                    placeholder={field.placeholder ?? "Enter " + field.label}
                    value={fieldValues[field.key] ?? ""}
                    onChangeText={(value) =>
                      handleFieldChange(field.key, value)
                    }
                    multiline
                  />
                )}

                {field.type === "date" && (
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder ?? "YYYY-MM-DD"}
                    value={fieldValues[field.key] ?? ""}
                    onChangeText={(value) =>
                      handleFieldChange(field.key, value)
                    }
                  />
                )}

                {field.type === "checkbox" && (
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() =>
                      handleFieldChange(field.key, !fieldValues[field.key])
                    }
                  >
                    <Switch
                      value={!!fieldValues[field.key]}
                      onValueChange={(value) =>
                        handleFieldChange(field.key, value)
                      }
                    />
                    <Text style={{ marginLeft: 8 }}>
                      {fieldValues[field.key] ? "Checked" : "Unchecked"}
                    </Text>
                  </TouchableOpacity>
                )}

                {field.type === "select" && (
                  <View style={styles.selectBox}>
                    <Text style={{ color: "#666", marginBottom: 6 }}>
                      {fieldValues[field.key] ??
                        field.placeholder ??
                        "Select..."}
                    </Text>
                    {field.options?.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={[
                          styles.optionRow,
                          opt === fieldValues[field.key]
                            ? { backgroundColor: "#f0f7ff" }
                            : {},
                        ]}
                        onPress={() => handleFieldChange(field.key, opt)}
                      >
                        <Text
                          style={{
                            color:
                              opt === fieldValues[field.key]
                                ? "#461053"
                                : "#222",
                            fontWeight:
                              opt === fieldValues[field.key] ? "700" : "400",
                          }}
                        >
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {field.type === "image" && (
                  <Image
                    source={{
                      uri:
                        fieldValues[field.key] ||
                        "https://via.placeholder.com/150?text=Image",
                    }}
                    style={styles.thumb}
                  />
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Form</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    );
  }

  // Render Vibration Data
  return (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Vibration Screen</Text>
        <Text style={styles.subtitle}>Screen ID: {screen_id}</Text>

        {data && (
          <View style={styles.dataContainer}>
            <Text style={styles.sectionTitle}>Vibration Information:</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>ID:</Text>
              <Text style={styles.value}>{data.id}</Text>
            </View>
            {data.title && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Title:</Text>
                <Text style={styles.value}>{data.title}</Text>
              </View>
            )}
            {data.description && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.value}>{data.description}</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Patterns:</Text>
            {data.patterns && data.patterns.length > 0 ? (
              <View style={styles.listContainer}>
                {data.patterns.map((pattern: any, idx: number) => (
                  <Text key={idx} style={styles.listItem}>
                    • {pattern.name || pattern.title || `Pattern ${idx + 1}`}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>No patterns available</Text>
            )}

            <Text style={styles.sectionTitle}>Raw Data:</Text>
            <View style={styles.jsonContainer}>
              <Text style={styles.jsonText}>
                {JSON.stringify(data, null, 2)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: spacing.lg,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    padding: spacing.lg,
  },
  formContainer: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  fieldRow: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 14,
    color: "#000",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 14,
    color: "#000",
  },
  selectBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  optionRow: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#f2f2f2",
  },
  thumb: {
    width: 120,
    height: 80,
    borderRadius: 6,
    marginTop: 6,
  },
  submitBtn: {
    backgroundColor: "#461053",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.h3,
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  debugText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  dataContainer: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    ...typography.body,
    fontWeight: "600",
    color: colors.text,
    width: 120,
  },
  value: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  listContainer: {
    paddingLeft: spacing.md,
  },
  listItem: {
    ...typography.body,
    color: colors.text,
    marginVertical: spacing.sm,
  },
  noDataText: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  jsonContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jsonText: {
    ...typography.caption,
    fontFamily: "monospace",
    color: colors.text,
  },
});
