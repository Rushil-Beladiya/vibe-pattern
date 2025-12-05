import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import formService, { Form, FormField } from "@/src/services/formService";
import screenService, { Screen } from "@/src/services/screenService";
import { colors } from "@/src/theme";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const FIELD_TYPES = [
  "text",
  "textarea",
  "select",
  "checkbox",
  "date",
  "image",
  "file",
];

export default function FormBuilderScreen() {
  const params = useLocalSearchParams();
  const formId = params.formId ? Number(params.formId) : null;

  const [screens, setScreens] = useState<Screen[]>([]);
  const [formName, setFormName] = useState("");
  const [selectedScreenId, setSelectedScreenId] = useState<number | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showScreenPicker, setShowScreenPicker] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(
    null
  );

  // Field modal state
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOptions, setFieldOptions] = useState("");

  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchScreens();
    if (formId) {
      fetchFormData();
    }
  }, [formId]);

  const fetchScreens = async () => {
    try {
      const data = await screenService.getAllScreens();
      setScreens(data);
    } catch (error: any) {
      showToast({
        message: error.response?.data?.message || "Failed to fetch screens",
        type: "error",
      });
    }
  };

  const fetchFormData = async () => {
    try {
      setIsLoading(true);
      const form = await formService.getFormById(formId!);
      setFormName(form.name);
      setSelectedScreenId(form.screen_id);
      setFields(form.fields || []);
    } catch (error: any) {
      showToast({
        message: error.response?.data?.message || "Failed to fetch form",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddField = () => {
    setEditingFieldIndex(null);
    setFieldLabel("");
    setFieldType("text");
    setFieldRequired(false);
    setFieldOptions("");
    setShowFieldModal(true);
  };

  const handleEditField = (index: number) => {
    const field = fields[index];
    setEditingFieldIndex(index);
    setFieldLabel(field.label);
    setFieldType(field.type);
    setFieldRequired(field.required || false);
    setFieldOptions(field.options ? field.options.join(", ") : "");
    setShowFieldModal(true);
  };

  const handleSaveField = () => {
    if (!fieldLabel.trim()) {
      showToast({ message: "Field label is required", type: "error" });
      return;
    }

    const newField: FormField = {
      label: fieldLabel.trim(),
      type: fieldType,
      required: fieldRequired,
      value: "",
    };

    if (fieldType === "select" || fieldType === "checkbox") {
      if (!fieldOptions.trim()) {
        showToast({
          message: "Options are required for this field type",
          type: "error",
        });
        return;
      }
      newField.options = fieldOptions
        .split(",")
        .map((opt) => opt.trim())
        .filter(Boolean);
    }

    if (editingFieldIndex !== null) {
      const updatedFields = [...fields];
      updatedFields[editingFieldIndex] = newField;
      setFields(updatedFields);
    } else {
      setFields([...fields, newField]);
    }

    setShowFieldModal(false);
  };

  const handleDeleteField = (index: number) => {
    Alert.alert("Delete Field", "Are you sure you want to delete this field?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedFields = fields.filter((_, i) => i !== index);
          setFields(updatedFields);
        },
      },
    ]);
  };

  const handleSaveForm = async () => {
    if (!formName.trim()) {
      showToast({ message: "Form name is required", type: "error" });
      return;
    }

    if (!selectedScreenId) {
      showToast({ message: "Please select a screen", type: "error" });
      return;
    }

    if (fields.length === 0) {
      showToast({ message: "Add at least one field", type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      if (formId) {
        await formService.updateForm(formId, {
          name: formName.trim(),
          screen_id: selectedScreenId,
          fields: fields,
        });
        showToast({ message: "Form updated successfully", type: "success" });
      } else {
        await formService.createForm({
          name: formName.trim(),
          screen_id: selectedScreenId,
          fields: fields,
        });
        showToast({ message: "Form created successfully", type: "success" });
      }
      router.back();
    } catch (error: any) {
      showToast({
        message: error.response?.data?.message || "Failed to save form",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = ({ item, index }: { item: FormField; index: number }) => (
    <View style={styles.fieldCard}>
      <View style={styles.fieldHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>
            {item.label}
            {item.required && <Text style={styles.requiredMark}> *</Text>}
          </Text>
          <Text style={styles.fieldType}>Type: {item.type}</Text>
          {item.options && item.options.length > 0 && (
            <Text style={styles.fieldOptions}>
              Options: {item.options.join(", ")}
            </Text>
          )}
        </View>
        <View style={styles.fieldActions}>
          <TouchableOpacity
            onPress={() => handleEditField(index)}
            style={styles.fieldActionBtn}
          >
            <Text style={styles.fieldActionText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteField(index)}
            style={styles.fieldActionBtn}
          >
            <Text style={styles.fieldActionText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {formId ? "Edit Form" : "Create Form"}
        </Text>
        <TouchableOpacity
          onPress={handleSaveForm}
          style={styles.saveBtn}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Form Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter form name"
            value={formName}
            onChangeText={setFormName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Screen</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowScreenPicker(true)}
          >
            <Text style={styles.pickerButtonText}>
              {selectedScreenId
                ? screens.find((s) => s.id === selectedScreenId)?.name
                : "Select Screen"}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Form Fields ({fields.length})
            </Text>
            <TouchableOpacity
              onPress={handleAddField}
              style={styles.addFieldBtn}
            >
              <Text style={styles.addFieldBtnText}>+ Add Field</Text>
            </TouchableOpacity>
          </View>

          {fields.length === 0 ? (
            <View style={styles.emptyFields}>
              <Text style={styles.emptyFieldsText}>No fields added yet</Text>
            </View>
          ) : (
            <FlatList
              data={fields}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderField}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Screen Picker Modal */}
      <Modal visible={showScreenPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Screen</Text>
            <FlatList
              data={screens}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedScreenId === item.id && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedScreenId(item.id);
                    setShowScreenPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowScreenPicker(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Field Modal */}
      <Modal visible={showFieldModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingFieldIndex !== null ? "Edit Field" : "Add Field"}
            </Text>

            <ScrollView style={{ maxHeight: 500 }}>
              <Text style={styles.fieldModalLabel}>Label</Text>
              <TextInput
                style={styles.input}
                placeholder="Field label"
                value={fieldLabel}
                onChangeText={setFieldLabel}
              />

              <Text style={styles.fieldModalLabel}>Type</Text>
              <View style={styles.typeGrid}>
                {FIELD_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      fieldType === type && styles.typeOptionSelected,
                    ]}
                    onPress={() => setFieldType(type)}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        fieldType === type && styles.typeOptionTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {(fieldType === "select" || fieldType === "checkbox") && (
                <>
                  <Text style={styles.fieldModalLabel}>
                    Options (comma separated)
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Option1, Option2, Option3"
                    value={fieldOptions}
                    onChangeText={setFieldOptions}
                    multiline
                  />
                </>
              )}

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setFieldRequired(!fieldRequired)}
              >
                <View
                  style={[
                    styles.checkbox,
                    fieldRequired && styles.checkboxChecked,
                  ]}
                >
                  {fieldRequired && <Text style={styles.checkboxIcon}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Required field</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setShowFieldModal(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSaveBtn]}
                onPress={handleSaveField}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                  Save Field
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  saveBtn: {
    padding: 8,
    minWidth: 60,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  pickerButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  pickerArrow: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addFieldBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addFieldBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyFields: {
    padding: 40,
    alignItems: "center",
  },
  emptyFieldsText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  fieldCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  requiredMark: {
    color: "#ef4444",
  },
  fieldType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  fieldOptions: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  fieldActions: {
    flexDirection: "row",
    gap: 8,
  },
  fieldActionBtn: {
    padding: 4,
  },
  fieldActionText: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemSelected: {
    backgroundColor: colors.primary + "20",
  },
  modalItemText: {
    fontSize: 16,
    color: colors.text,
  },
  modalCloseBtn: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.border,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  fieldModalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  typeOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  typeOptionTextSelected: {
    color: "#fff",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxIcon: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelBtn: {
    backgroundColor: colors.border,
  },
  modalSaveBtn: {
    backgroundColor: colors.primary,
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
});
