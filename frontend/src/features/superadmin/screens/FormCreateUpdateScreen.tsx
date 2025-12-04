import { useToast } from "@/src/context";
import { api, sendRequest } from "@/src/lib/api";
import React, { FC, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Field = {
  key: string;
  label: string;
  type: string;
  options: string[];
};

const FIELD_TYPES = ["text", "email", "number", "select", "image"];

export const FormCreateUpdateScreen: FC = () => {
  const { showToast } = useToast();

  const [formName, setFormName] = useState("");
  const [screen, setScreen] = useState("");
  const [fields, setFields] = useState<Field[]>([
    {
      key: "field_1",
      label: "",
      type: "text",
      options: [],
    },
  ]);
  const [openedDropdown, setOpenedDropdown] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const generateKey = (label: string, index: number) => {
    if (label.trim()) {
      return label.toLowerCase().replace(/\s+/g, "_");
    }
    return `field_${index + 1}`;
  };

  const addNewField = () => {
    setFields([
      ...fields,
      {
        key: `field_${fields.length + 1}`,
        label: "",
        type: "text",
        options: [],
      },
    ]);
  };

  const updateField = (index: number, key: keyof Field, value: any) => {
    const updated = [...fields];

    if (key === "label") {
      updated[index].label = value;
      updated[index].key = generateKey(value, index);
    } else {
      updated[index][key] = value;
    }

    setFields(updated);
  };

  const updateOptions = (index: number, text: string) => {
    const options = text
      .split(",")
      .map((o) => o.trim())
      .filter((o) => o);
    updateField(index, "options", options);
  };

  const removeField = (index: number) => {
    if (fields.length === 1) {
      showToast({
        message: "At least one field is required",
        type: "error",
      });
      return;
    }

    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formName.trim()) {
      showToast({
        message: "Form name is required",
        type: "error",
      });
      return;
    }

    if (!screen.trim()) {
      showToast({
        message: "Screen is required",
        type: "error",
      });
      return;
    }

    // Check if all fields have labels
    const emptyField = fields.find((field) => !field.label.trim());
    if (emptyField) {
      showToast({
        message: "All fields must have a label",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = {
        name: formName.trim(),
        screen: screen.trim(),
        fields: fields.map((field) => ({
          key: field.key,
          label: field.label.trim(),
          type: field.type,
          ...(field.type === "select" ? { options: field.options } : {}),
        })),
      };

      console.log("Submitting form:", formData);

      const response = await sendRequest({
        url: api.formCreate(),
        method: "post",
        data: formData,
      });

      console.log("Response:", response);

      if (response.success) {
        showToast({
          message: "Form created successfully!",
          type: "success",
        });

        // Reset form
        setFormName("");
        setScreen("");
        setFields([
          {
            key: "field_1",
            label: "",
            type: "text",
            options: [],
          },
        ]);
      } else {
        showToast({
          message: response.message || "Failed to create form",
          type: "error",
        });
      }
    } catch (err: any) {
      console.error("Error creating form:", err);
      showToast({
        message: err.message || "Failed to create form",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const openTypeModal = (index: number) => {
    setOpenedDropdown(index);
    setIsModalVisible(true);
  };

  const closeTypeModal = () => {
    setIsModalVisible(false);
    setOpenedDropdown(null);
  };

  const selectFieldType = (index: number, type: string) => {
    updateField(index, "type", type);
    closeTypeModal();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Create New Form</Text>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Form Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Form Name *</Text>
          <TextInput
            style={styles.input}
            value={formName}
            onChangeText={setFormName}
            placeholder="e.g., User Registration"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Screen *</Text>
          <TextInput
            style={styles.input}
            value={screen}
            onChangeText={setScreen}
            placeholder="e.g., home, profile, settings"
            placeholderTextColor="#999"
          />
          <Text style={styles.hint}>
            Enter screen where form will be displayed
          </Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Form Fields</Text>
          <Text style={styles.fieldCount}>{fields.length} field(s)</Text>
        </View>

        {fields.map((field, index) => (
          <View key={index} style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldNumber}>Field {index + 1}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeField(index)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Field Label */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Label *</Text>
              <TextInput
                style={styles.input}
                value={field.label}
                onChangeText={(val) => updateField(index, "label", val)}
                placeholder="e.g., Full Name, Email Address"
                placeholderTextColor="#999"
              />
              <Text style={styles.hint}>Key: {field.key}</Text>
            </View>

            {/* Field Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Type</Text>
              <TouchableOpacity
                style={styles.typeSelector}
                onPress={() => openTypeModal(index)}
              >
                <Text style={styles.typeSelectorText}>
                  {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Options for select type */}
            {field.type === "select" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Options</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter options separated by commas"
                  placeholderTextColor="#999"
                  onChangeText={(val) => updateOptions(index, val)}
                />
                <Text style={styles.hint}>e.g., Male, Female, Other</Text>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.addFieldButton} onPress={addNewField}>
          <Text style={styles.addFieldButtonText}>+ Add New Field</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>Create Form</Text>
        )}
      </TouchableOpacity>

      {/* Field Type Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeTypeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeTypeModal}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Field Type</Text>
            {FIELD_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.modalItem}
                onPress={() =>
                  openedDropdown !== null &&
                  selectFieldType(openedDropdown, type)
                }
              >
                <Text style={styles.modalItemText}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={closeTypeModal}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#333",
  },
  formSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  fieldCount: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#444",
  },
  hint: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  fieldCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  fieldNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#461053",
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffebee",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#d32f2f",
    fontSize: 16,
    fontWeight: "bold",
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  typeSelectorText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownArrow: {
    color: "#666",
    fontSize: 12,
  },
  addFieldButton: {
    backgroundColor: "#461053",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  addFieldButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#2e7d32",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: "#81c784",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "80%",
    maxWidth: 300,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  modalItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  modalCancel: {
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
});
