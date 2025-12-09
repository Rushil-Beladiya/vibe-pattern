import React, { useState, useLayoutEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import CustomHeader from "@/src/components/CustomHeader";
import { sendRequest } from "@/src/lib/api";

type Field = {
  key: string;
  label: string;
  type: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  value?: any;
};

type Form = {
  id: number;
  name: string;
  screen: any;
  fields: Field[];
  created_at?: string;
  updated_at?: string;
};

export default function FormViewScreen() {
  const params = useLocalSearchParams();
  const formParam = params?.form as string | undefined;
  const screenParam = params?.screen_id as string | undefined;
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [fieldValues, setFieldValues] = useState<{ [key: string]: any }>({});

  // Lazy parse form param if provided; otherwise fetch by screen id
  useLayoutEffect(() => {
    let mounted = true;

    async function load() {
      // If a full form was passed in params, parse and use it immediately
      if (formParam) {
        try {
          let parsed: any = formParam;
          if (typeof parsed === "string") {
            if (parsed.startsWith("%7B") || parsed.startsWith("%22%7B")) {
              parsed = JSON.parse(decodeURIComponent(parsed));
            } else if (parsed.startsWith("{")) {
              parsed = JSON.parse(parsed);
            } else {
              try {
                parsed = JSON.parse(decodeURIComponent(parsed));
              } catch (err) {
                // ignore
              }
            }
          }
          if (mounted) {
            setForm(parsed as Form);
            initializeFieldValues(parsed.fields);
          }
          return;
        } catch (e) {
          // fall through to fetching by screen id
        }
      }

      // Fetch by screen id (default to 1 if nothing provided)
      const screenId = screenParam ?? "1";
      try {
        setLoading(true);
        const response = await sendRequest({
          url: `admin/forms/${screenId}`,
          method: "get",
        });

        console.log("✅ Fetched form data for screen:", screenId, response);

        if (mounted && response.success && response.data) {
          const data = response.data;
          // normalize fields array if present on data
          const normalized: Form = {
            id: data.id ?? 0,
            name: data.name ?? data.title ?? "",
            screen: data.screen ?? {
              id: data.screen_id ?? screenId,
              name: data.screen?.name ?? "",
            },
            fields: data.fields ?? data.data?.fields ?? [],
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
          setForm(normalized);
          initializeFieldValues(normalized.fields);
        }
      } catch (err) {
        console.error("❌ Error fetching form:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [formParam, screenParam]);

  const initializeFieldValues = (fields: Field[]) => {
    const values: { [key: string]: any } = {};
    fields.forEach((field) => {
      values[field.key] = field.value ?? "";
    });
    setFieldValues(values);
  };

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
      // Prepare fields with updated values
      const submitFields = form.fields.map((field) => ({
        ...field,
        value: fieldValues[field.key],
      }));

      const payload = {
        fields: submitFields,
      };

      console.log("📤 Submitting form data:", payload);

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
            onPress: () => router.back(),
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#461053" />
        <Text style={{ color: "#666", marginTop: 8 }}>Loading form...</Text>
      </View>
    );
  }

  if (!form) {
    // Show an empty/blank screen with header when there is no form data
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <CustomHeader title="Form View" showBackButton />
        <View style={{ flex: 1, backgroundColor: "#fff" }} />
      </View>
    );
  }

  const headerImageField = form.fields?.find(
    (f) => f.type === "image" || f.key === "cover_image"
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <CustomHeader title={form.name} showBackButton />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      >
        <View style={styles.header}>
          {headerImageField ? (
            <Image
              source={{
                uri:
                  fieldValues[headerImageField.key] ||
                  "https://via.placeholder.com/600x200?text=Cover",
              }}
              style={styles.cover}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cover, styles.coverPlaceholder]}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {form.name}
              </Text>
            </View>
          )}
          <Text style={styles.formName}>{form.name}</Text>
          <Text style={styles.screenName}>{form.screen?.name ?? ""}</Text>
        </View>

        <View style={{ marginTop: 12 }}>
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
                  onChangeText={(value) => handleFieldChange(field.key, value)}
                />
              )}

              {field.type === "textarea" && (
                <TextInput
                  style={[styles.input, { minHeight: 100 }]}
                  placeholder={field.placeholder ?? "Enter " + field.label}
                  value={fieldValues[field.key] ?? ""}
                  onChangeText={(value) => handleFieldChange(field.key, value)}
                  multiline
                />
              )}

              {field.type === "select" && (
                <View style={styles.selectBox}>
                  <Text style={{ color: "#666", marginBottom: 6 }}>
                    {fieldValues[field.key] ?? field.placeholder ?? "Select..."}
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
                            opt === fieldValues[field.key] ? "#461053" : "#222",
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

              {field.type === "date" && (
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder ?? "YYYY-MM-DD"}
                  value={fieldValues[field.key] ?? ""}
                  onChangeText={(value) => handleFieldChange(field.key, value)}
                />
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

              {field.type === "file" && (
                <TouchableOpacity style={styles.fileBtn}>
                  <Text style={{ color: "#fff" }}>
                    {fieldValues[field.key]
                      ? String(fieldValues[field.key]).split("/").pop()
                      : "Choose file"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Form</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { marginBottom: 8 },
  cover: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  coverPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#461053",
  },
  formName: { fontSize: 20, fontWeight: "700", marginTop: 12 },
  screenName: { color: "#666", marginTop: 4 },
  fieldRow: { marginBottom: 16 },
  fieldLabel: { fontWeight: "600", marginBottom: 8, fontSize: 14 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 14,
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
  thumb: { width: 120, height: 80, borderRadius: 6, marginTop: 6 },
  fileBtn: {
    backgroundColor: "#461053",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  submitBtn: {
    backgroundColor: "#461053",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export { FormViewScreen };
