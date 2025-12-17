import React, { FC } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";

interface SelectFieldProps {
  label?: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: string[];
  required?: boolean;
  error?: string;
  editable?: boolean;
}

export const SelectField: FC<SelectFieldProps> = ({
  label,
  value = "",
  onValueChange,
  options = [],
  required = false,
  error,
  editable = true,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.selectButton,
          error && styles.selectError,
          !editable && styles.selectDisabled,
        ]}
        onPress={() => editable && setIsOpen(!isOpen)}
        disabled={!editable}
      >
        <Text
          style={[
            styles.selectButtonText,
            !value && styles.placeholderText,
            !editable && styles.selectDisabledText,
          ]}
        >
          {value || "Select an option"}
        </Text>
      </TouchableOpacity>

      {isOpen && editable && (
        <View style={styles.optionsContainer}>
          <ScrollView nestedScrollEnabled>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  value === option && styles.optionSelected,
                ]}
                onPress={() => {
                  onValueChange(option);
                  setIsOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 1,
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
  selectButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  selectButtonText: {
    fontSize: 14,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },
  selectError: {
    borderColor: "red",
  },
  selectDisabled: {
    backgroundColor: "#f5f5f5",
  },
  selectDisabledText: {
    color: "#999",
  },
  optionsContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: "#fff",
    maxHeight: 200,
    marginTop: -1,
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionSelected: {
    backgroundColor: "#e3f2fd",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
  },
  optionTextSelected: {
    color: "#2196F3",
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
