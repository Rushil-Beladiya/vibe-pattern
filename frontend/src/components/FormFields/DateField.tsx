import React, { FC } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface DateFieldProps {
  label?: string;
  value?: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  error?: string;
  editable?: boolean;
}

export const DateField: FC<DateFieldProps> = ({
  label,
  value = "",
  onValueChange,
  required = false,
  error,
  editable = true,
}) => {
  const [showPicker, setShowPicker] = React.useState(false);
  const [date, setDate] = React.useState<Date>(
    value ? new Date(value) : new Date()
  );

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (selectedDate) {
      setDate(selectedDate);
      const isoString = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD format
      onValueChange(isoString);
    }
  };

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return "Select date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

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
          styles.dateButton,
          error && styles.dateError,
          !editable && styles.dateDisabled,
        ]}
        onPress={() => editable && setShowPicker(true)}
        disabled={!editable}
      >
        <Text
          style={[
            styles.dateButtonText,
            !value && styles.placeholderText,
            !editable && styles.dateDisabledText,
          ]}
        >
          📅 {formatDisplayDate(value)}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
        />
      )}

      {Platform.OS === "ios" && showPicker && (
        <TouchableOpacity
          style={styles.datePickerDone}
          onPress={() => setShowPicker(false)}
        >
          <Text style={styles.datePickerDoneText}>Done</Text>
        </TouchableOpacity>
      )}

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
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  dateButtonText: {
    fontSize: 14,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },
  dateError: {
    borderColor: "red",
  },
  dateDisabled: {
    backgroundColor: "#f5f5f5",
  },
  dateDisabledText: {
    color: "#999",
  },
  datePickerDone: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#2196F3",
    alignItems: "center",
    marginTop: 8,
    borderRadius: 8,
  },
  datePickerDoneText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
