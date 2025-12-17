import { sendRequest } from "@/src/lib/api";
import React, { FC, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  TextInputField,
  SelectField,
  ImageField,
  FileField,
  DateField,
  CheckboxField,
} from "@/src/components/FormFields";

interface FormField {
  key: string;
  label: string;
  type: string;
  value?: string | boolean;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  allowed_mimes?: string[];
}

interface FormData {
  id: number;
  name: string;
  fields: FormField[];
  is_active: boolean;
}

interface ScreenData {
  id: number;
  name: string;
  slug: string;
  forms: FormData[];
}

export const AdminMusicScreen: FC = () => {
  const [screenData, setScreenData] = useState<ScreenData | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fileData, setFileData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchScreenData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchScreenData = async () => {
    try {
      setLoading(true);
      const response = await sendRequest({
        url: `admin/screens/1`,
        method: "get",
      });

      if (response.success && response.data) {
        setScreenData(response.data);
        initializeFormData(response.data.forms[0]);
        setError(null);
      } else {
        setError(response.message || "Failed to fetch data.");
      }
    } catch (err) {
      console.warn("fetchScreenData error:", err);
      setError("Failed to load form");
    } finally {
      setLoading(false);
    }
  };

  const initializeFormData = (form: FormData) => {
    const initialData: Record<string, any> = {};
    form.fields.forEach((field) => {
      initialData[field.key] = field.value || "";
    });
    setFormData(initialData);
  };

  const handleFieldChange = (key: string, value: any, fileInfo?: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (fileInfo) {
      setFileData((prev) => ({
        ...prev,
        [key]: fileInfo,
      }));
    }
  };

  const validateForm = (): boolean => {
    const form = screenData?.forms[0];
    if (!form) return false;

    for (const field of form.fields) {
      if (field.required && !formData[field.key]) {
        Alert.alert("Validation Error", `${field.label} is required`);
        return false;
      }
    }
    return true;
  };

  const buildFormDataPayload = () => {
    const form = screenData?.forms[0];
    if (!form) return new FormData();

    const payload = new FormData();
    const fieldsArray: any[] = [];

    form.fields.forEach((field) => {
      const fieldData = {
        ...field,
        value: formData[field.key] || "",
      };

      if (
        (field.type === "file" || field.type === "image") &&
        fileData[field.key]
      ) {
        const fileInfo = fileData[field.key];
        payload.append(field.key, {
          uri: fileInfo.uri,
          type: fileInfo.type,
          name: fileInfo.name,
        } as any);
      }

      fieldsArray.push(fieldData);
    });

    payload.append("fields", JSON.stringify(fieldsArray));
    return payload;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const form = screenData?.forms[0];
      if (!form) {
        Alert.alert("Error", "Form not found");
        return;
      }

      const payload = buildFormDataPayload();

      const response = await sendRequest({
        url: `admin/forms/${form.id}/submit`,
        method: "post",
        data: payload,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.success) {
        setSuccessMessage(`Form submitted successfully!`);
        setTimeout(() => {
          setSuccessMessage(null);
          initializeFormData(form);
        }, 2000);
      } else {
        Alert.alert("Error", response.message || "Failed to submit form");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      Alert.alert("Error", "Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      label: field.label,
      value: formData[field.key],
      required: field.required,
      editable: !submitting,
    };

    switch (field.type) {
      case "text":
      case "input":
        return (
          <TextInputField
            key={field.key}
            {...commonProps}
            placeholder={field.placeholder}
            onChangeText={(value) => handleFieldChange(field.key, value)}
          />
        );

      case "textarea":
        return (
          <TextInputField
            key={field.key}
            {...commonProps}
            placeholder={field.placeholder}
            multiline
            numberOfLines={4}
            onChangeText={(value) => handleFieldChange(field.key, value)}
          />
        );

      case "select":
        return (
          <SelectField
            key={field.key}
            {...commonProps}
            options={field.options || []}
            onValueChange={(value) => handleFieldChange(field.key, value)}
          />
        );

      case "image":
        return (
          <ImageField
            key={field.key}
            {...commonProps}
            onValueChange={(value, fileInfo) =>
              handleFieldChange(field.key, value, fileInfo)
            }
          />
        );

      case "file":
        return (
          <FileField
            key={field.key}
            {...commonProps}
            allowedMimes={field.allowed_mimes}
            onValueChange={(value, fileInfo) =>
              handleFieldChange(field.key, value, fileInfo)
            }
          />
        );

      case "date":
        return (
          <DateField
            key={field.key}
            {...commonProps}
            onValueChange={(value) => handleFieldChange(field.key, value)}
          />
        );

      case "checkbox":
        return (
          <CheckboxField
            key={field.key}
            {...commonProps}
            value={formData[field.key] || false}
            onValueChange={(value) => handleFieldChange(field.key, value)}
          />
        );

      default:
        return null;
    }
  };

  const form = screenData?.forms[0];

  return (
    <View style={styles.container}>
      {successMessage && (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>✓ {successMessage}</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading form...</Text>
        </View>
      )}

      {!loading && form && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <View>
            <Text style={styles.title}>{form.name}</Text>
            <Text style={styles.subtitle}>
              Please fill in all required fields marked with *
            </Text>

            <View style={styles.formContainer}>
              {form.fields.map((field) => renderField(field))}
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitForm}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Form</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  successMessage: {
    backgroundColor: "#4caf50",
    padding: 12,
    marginBottom: 8,
  },
  successText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  errorBanner: {
    backgroundColor: "#f44336",
    padding: 12,
    marginBottom: 8,
  },
  errorText: {
    color: "#fff",
    fontSize: 14,
  },
});
