import CustomHeader from "@/src/components/CustomHeader";
import { useRouter } from "expo-router";
import React, { FC, useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "../../context/ToastContext";
import { sendRequest } from "../../lib/api";

interface FormCreateScreenProps {}

type Screen = {
  id: number;
  name: string;
  slug: string;
};

type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "image" | "file" | "date" | "checkbox";
  placeholder?: string;
  required?: boolean;
  options?: string[];
  value?: string;
};

type FormData = {
  name: string;
  screenId: number | null;
  fields: Field[];
  is_active: boolean;
};

export const FormCreateScreen: FC<FormCreateScreenProps> = () => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    screenId: null,
    fields: [],
    is_active: true,
  });
  const [screenModalVisible, setScreenModalVisible] = useState(false);
  const [fieldModalVisible, setFieldModalVisible] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(
    null
  );
  const [fieldForm, setFieldForm] = useState({
    label: "",
    type: "text" as Field["type"],
    placeholder: "",
    required: false,
    options: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetchScreens();
  }, []);

  const fetchScreens = async () => {
    try {
      const response = await sendRequest({
        url: "super-admin/screens",
        method: "get",
      });
      if (response.success && response.data) {
        setScreens(response.data as Screen[]);
      }
    } catch (error) {
      console.error("Error fetching screens:", error);
    }
  };

  const selectScreen = (screen: Screen) => {
    setFormData({ ...formData, screenId: screen.id });
    setScreenModalVisible(false);
  };

  const openAddField = () => {
    setEditingFieldIndex(null);
    setFieldForm({
      label: "",
      type: "text",
      placeholder: "",
      required: false,
      options: "",
    });
    setFieldModalVisible(true);
  };

  const openEditField = (index: number) => {
    const field = formData.fields[index];
    setEditingFieldIndex(index);
    setFieldForm({
      label: field.label,
      type: field.type,
      placeholder: field.placeholder || "",
      required: field.required || false,
      options: field.options?.join(", ") || "",
    });
    setFieldModalVisible(true);
  };

  const saveField = () => {
    if (!fieldForm.label.trim()) {
      showToast({ type: "error", message: "Field label is required" });
      return;
    }

    const key = fieldForm.label
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^\w_]/g, "");

    const newField: Field = {
      key,
      label: fieldForm.label,
      type: fieldForm.type,
      placeholder: fieldForm.placeholder || undefined,
      required: fieldForm.required,
      options:
        fieldForm.type === "select"
          ? fieldForm.options
              .split(",")
              .map((o) => o.trim())
              .filter((o) => o)
          : undefined,
      value: "",
    };

    if (editingFieldIndex !== null) {
      const updatedFields = [...formData.fields];
      updatedFields[editingFieldIndex] = newField;
      setFormData({ ...formData, fields: updatedFields });
    } else {
      setFormData({
        ...formData,
        fields: [...formData.fields, newField],
      });
    }

    setFieldModalVisible(false);
  };

  const deleteField = (index: number) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast({ type: "error", message: "Form name is required" });
      return;
    }
    if (!formData.screenId) {
      showToast({ type: "error", message: "Please select a screen" });
      return;
    }
    if (formData.fields.length === 0) {
      showToast({ type: "error", message: "Please add at least one field" });
      return;
    }

    setLoading(true);
    try {
      const fields = formData.fields.map((field) => ({
        ...field,
        required: field.required ? "true" : "false",
      }));
      const response = await sendRequest({
        url: `super-admin/screens/${formData.screenId}/forms`,
        method: "post",
        data: {
          name: formData.name,
          fields,
          is_active: formData.is_active,
        },
      });
      console.log("response create forms -> ", response);
      if (response.success) {
        router.back();
      } else {
        showToast({
          type: "error",
          message: response.message || "Failed to create form",
        });
      }
    } catch (error) {
      console.error("Error creating form:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedScreen = screens.find((s) => s.id === formData.screenId);

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title="Create Form" showBackButton />

      <ScrollView style={styles.container}>
        <Text style={styles.label}>Form Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. User Registration"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />

        <Text style={styles.label}>Select Screen *</Text>
        <TouchableOpacity
          style={styles.selectBtn}
          onPress={() => setScreenModalVisible(true)}
        >
          <Text
            style={
              selectedScreen ? styles.selectBtnTextActive : styles.selectBtnText
            }
          >
            {selectedScreen ? selectedScreen.name : "Choose a Screen..."}
          </Text>
        </TouchableOpacity>

        <View style={styles.toggleRow}>
          <Text style={styles.label}>Active</Text>
          <View style={styles.toggleGroup}>
            {[true, false].map((val) => (
              <TouchableOpacity
                key={String(val)}
                style={[
                  styles.toggleBtn,
                  formData.is_active === val && styles.toggleBtnActive,
                ]}
                onPress={() => setFormData({ ...formData, is_active: val })}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    formData.is_active === val && styles.toggleBtnTextActive,
                  ]}
                >
                  {val ? "Yes" : "No"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.fieldsSection}>
          <Text style={styles.sectionTitle}>Form Fields *</Text>

          {formData.fields.map((field, index) => (
            <View key={field.key} style={styles.fieldItem}>
              <View style={styles.fieldInfo}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <Text style={styles.fieldType}>
                  {field.type} {field.required ? "• Required" : ""}
                </Text>
              </View>
              <View style={styles.fieldActions}>
                <TouchableOpacity
                  style={[styles.fieldBtn, styles.editFieldBtn]}
                  onPress={() => openEditField(index)}
                >
                  <Text style={styles.fieldBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.fieldBtn, styles.deleteFieldBtn]}
                  onPress={() => deleteField(index)}
                >
                  <Text style={styles.fieldBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addFieldBtn} onPress={openAddField}>
            <Text style={styles.addFieldBtnText}>+ Add Field</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.submitBtn, styles.cancelBtn]}
            onPress={() => router.back()}
          >
            <Text style={styles.submitBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, styles.createBtn]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={[styles.submitBtnText, { color: "#fff" }]}>
              {loading ? "Creating..." : "Create Form"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={screenModalVisible} animationType="slide" transparent>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Screen</Text>
                <TouchableOpacity onPress={() => setScreenModalVisible(false)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={screens}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.screenOption}
                    onPress={() => selectScreen(item)}
                  >
                    <Text style={styles.screenOptionText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={fieldModalVisible} animationType="slide" transparent>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingFieldIndex !== null ? "Edit Field" : "Add Field"}
                </Text>
                <TouchableOpacity onPress={() => setFieldModalVisible(false)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.label}>Label *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. First Name"
                  value={fieldForm.label}
                  onChangeText={(text) =>
                    setFieldForm({ ...fieldForm, label: text })
                  }
                />

                <Text style={styles.label}>Type *</Text>
                <View style={styles.typeGrid}>
                  {[
                    "text",
                    "textarea",
                    "select",
                    "image",
                    "file",
                    "date",
                    "checkbox",
                  ].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        fieldForm.type === type && styles.typeOptionActive,
                      ]}
                      onPress={() =>
                        setFieldForm({
                          ...fieldForm,
                          type: type as Field["type"],
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          fieldForm.type === type &&
                            styles.typeOptionTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Placeholder</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Enter your name"
                  value={fieldForm.placeholder}
                  onChangeText={(text) =>
                    setFieldForm({ ...fieldForm, placeholder: text })
                  }
                />

                {fieldForm.type === "select" && (
                  <>
                    <Text style={styles.label}>Options (comma-separated)</Text>
                    <TextInput
                      style={[styles.input, { minHeight: 60 }]}
                      placeholder="Option 1, Option 2, Option 3"
                      value={fieldForm.options}
                      onChangeText={(text) =>
                        setFieldForm({ ...fieldForm, options: text })
                      }
                      multiline
                    />
                  </>
                )}

                <View style={styles.toggleRow}>
                  <Text style={styles.label}>Required</Text>
                  <View style={styles.toggleGroup}>
                    {[true, false].map((val) => (
                      <TouchableOpacity
                        key={String(val)}
                        style={[
                          styles.toggleBtn,
                          fieldForm.required === val && styles.toggleBtnActive,
                        ]}
                        onPress={() =>
                          setFieldForm({ ...fieldForm, required: val })
                        }
                      >
                        <Text
                          style={[
                            styles.toggleBtnText,
                            fieldForm.required === val &&
                              styles.toggleBtnTextActive,
                          ]}
                        >
                          {val ? "Yes" : "No"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.submitBtn, styles.cancelBtn]}
                  onPress={() => setFieldModalVisible(false)}
                >
                  <Text style={styles.submitBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, styles.createBtn]}
                  onPress={saveField}
                >
                  <Text style={[styles.submitBtnText, { color: "#fff" }]}>
                    Save Field
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  label: { fontSize: 14, fontWeight: "600", marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  selectBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  selectBtnText: { color: "#999" },
  selectBtnTextActive: { color: "#000", fontWeight: "600" },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  toggleGroup: { flexDirection: "row", gap: 8 },
  toggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  toggleBtnActive: { backgroundColor: "#461053", borderColor: "#461053" },
  toggleBtnText: { color: "#666", fontWeight: "600", fontSize: 12 },
  toggleBtnTextActive: { color: "#fff" },

  fieldsSection: { marginTop: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  fieldItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldInfo: { flex: 1 },
  fieldLabel: { fontSize: 14, fontWeight: "600" },
  fieldType: { color: "#666", fontSize: 12, marginTop: 4 },
  fieldActions: { flexDirection: "row", gap: 6 },
  fieldBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  editFieldBtn: { backgroundColor: "#461053" },
  deleteFieldBtn: { backgroundColor: "#d32f2f" },
  fieldBtnText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  addFieldBtn: {
    backgroundColor: "#e8d4f0",
    borderWidth: 1,
    borderColor: "#461053",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  addFieldBtnText: { color: "#461053", fontWeight: "600" },

  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 20,
  },
  submitBtn: { flex: 1, paddingVertical: 12, borderRadius: 8 },
  cancelBtn: { backgroundColor: "#f0f0f0" },
  createBtn: { backgroundColor: "#461053" },
  submitBtnText: { textAlign: "center", fontWeight: "600", color: "#000" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  closeBtn: { fontSize: 24, color: "#666" },
  modalBody: { padding: 16 },
  modalFooter: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },

  screenOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  screenOptionText: { fontSize: 16 },

  typeGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  typeOption: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  typeOptionActive: { backgroundColor: "#461053", borderColor: "#461053" },
  typeOptionText: { color: "#666", fontWeight: "600", fontSize: 12 },
  typeOptionTextActive: { color: "#fff" },
});
