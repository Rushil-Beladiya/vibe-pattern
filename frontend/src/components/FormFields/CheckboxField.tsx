import React, { FC } from "react";
import { StyleSheet, View, Text, Switch } from "react-native";

interface CheckboxFieldProps {
  label?: string;
  value?: boolean | string;
  onValueChange: (value: boolean) => void;
  required?: boolean;
  error?: string;
  editable?: boolean;
}

export const CheckboxField: FC<CheckboxFieldProps> = ({
  label,
  value = false,
  onValueChange,
  required = false,
  error,
  editable = true,
}) => {
  // Convert string value to boolean if needed
  const isChecked =
    typeof value === "string" ? value === "true" || value === "1" : !!value;

  return (
    <View style={styles.container}>
      <View style={styles.checkboxContainer}>
        <Switch
          style={styles.switch}
          value={isChecked}
          onValueChange={onValueChange}
          disabled={!editable}
          trackColor={{ false: "#ddd", true: "#81c784" }}
          thumbColor={isChecked ? "#4caf50" : "#999"}
        />

        {label && (
          <View style={styles.labelContainer}>
            <Text style={[styles.label, !editable && styles.labelDisabled]}>
              {label}
              {required && <Text style={styles.required}>*</Text>}
            </Text>
          </View>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  switch: {
    marginRight: 12,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  labelDisabled: {
    color: "#999",
  },
  required: {
    color: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 44,
  },
});
