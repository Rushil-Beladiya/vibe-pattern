import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Image,
  ActivityIndicator,
} from "react-native";

export type FormField = {
  key: string;
  label: string;
  type: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  value?: any;
};

interface FormRendererProps {
  fields: FormField[];
  values: { [key: string]: any };
  onChange: (key: string, value: any) => void;
  onSubmit?: () => void;
  submitting?: boolean;
  submitButtonText?: string;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  fields,
  values,
  onChange,
  onSubmit,
  submitting = false,
  submitButtonText = "Submit",
}) => {
  return (
    <View>
      {fields.map((field) => (
        <View style={styles.fieldContainer} key={field.key}>
          <Text style={styles.label}>
            {field.label}
            {field.required ? " *" : ""}
          </Text>

          {field.type === "text" && (
            <TextInput
              style={styles.input}
              placeholder={field.placeholder ?? `Enter ${field.label}`}
              value={values[field.key] ?? ""}
              onChangeText={(value) => onChange(field.key, value)}
              placeholderTextColor="#999"
            />
          )}

          {field.type === "textarea" && (
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder={field.placeholder ?? `Enter ${field.label}`}
              value={values[field.key] ?? ""}
              onChangeText={(value) => onChange(field.key, value)}
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
          )}

          {field.type === "date" && (
            <TextInput
              style={styles.input}
              placeholder={field.placeholder ?? "YYYY-MM-DD"}
              value={values[field.key] ?? ""}
              onChangeText={(value) => onChange(field.key, value)}
              placeholderTextColor="#999"
            />
          )}

          {field.type === "checkbox" && (
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => onChange(field.key, !values[field.key])}
            >
              <Switch
                value={!!values[field.key]}
                onValueChange={(value) => onChange(field.key, value)}
                trackColor={{ false: "#ddd", true: "#461053" }}
              />
              <Text style={styles.checkboxLabel}>
                {values[field.key] ? "Checked" : "Unchecked"}
              </Text>
            </TouchableOpacity>
          )}

          {field.type === "select" && (
            <View style={styles.selectBox}>
              <Text style={styles.selectValue}>
                {values[field.key] ?? field.placeholder ?? "Select an option"}
              </Text>
              <View style={styles.optionsContainer}>
                {field.options?.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      option === values[field.key] && styles.optionButtonActive,
                    ]}
                    onPress={() => onChange(field.key, option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        option === values[field.key] && styles.optionTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {field.type === "image" && (
            <Image
              source={{
                uri:
                  values[field.key] ||
                  "https://via.placeholder.com/200x150?text=Image",
              }}
              style={styles.imagePreview}
            />
          )}

          {field.type === "file" && (
            <TouchableOpacity style={styles.fileButton}>
              <Text style={styles.fileButtonText}>
                {values[field.key]
                  ? String(values[field.key]).split("/").pop()
                  : "Choose file"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {onSubmit && (
        <TouchableOpacity
          style={[
            styles.submitButton,
            submitting && styles.submitButtonDisabled,
          ]}
          onPress={onSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{submitButtonText}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#000",
  },
  textarea: {
    minHeight: 100,
    paddingTop: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkboxLabel: {
    marginLeft: 12,
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  selectBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  selectValue: {
    fontSize: 14,
    color: "#000",
    marginBottom: 10,
    fontWeight: "500",
  },
  optionsContainer: {
    gap: 6,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#eee",
  },
  optionButtonActive: {
    backgroundColor: "#461053",
    borderColor: "#461053",
  },
  optionText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  optionTextActive: {
    color: "#fff",
  },
  imagePreview: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  fileButton: {
    backgroundColor: "#461053",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  fileButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#461053",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
