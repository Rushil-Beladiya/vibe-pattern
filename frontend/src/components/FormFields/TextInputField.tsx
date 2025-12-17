import React, { FC } from "react";
import { StyleSheet, TextInput, View, Text } from "react-native";

interface TextInputFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText: (text: string) => void;
  required?: boolean;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  editable?: boolean;
}

export const TextInputField: FC<TextInputFieldProps> = ({
  label,
  placeholder,
  value = "",
  onChangeText,
  required = false,
  error,
  multiline = false,
  numberOfLines = 1,
  keyboardType = "default",
  editable = true,
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          multiline && styles.textareaInput,
          error && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
        placeholder={placeholder || "Enter text"}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        editable={editable}
        placeholderTextColor="#999"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  required: {
    color: "red",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#fff",
  },
  textareaInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "red",
  },
  inputDisabled: {
    backgroundColor: "#f5f5f5",
    color: "#999",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
