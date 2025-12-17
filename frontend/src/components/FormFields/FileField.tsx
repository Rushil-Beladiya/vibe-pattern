import React, { FC } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

interface FileFieldProps {
  label?: string;
  value?: string;
  onValueChange: (value: string, file?: any) => void;
  required?: boolean;
  error?: string;
  allowedMimes?: string[];
  editable?: boolean;
}

export const FileField: FC<FileFieldProps> = ({
  label,
  value = "",
  onValueChange,
  required = false,
  error,
  allowedMimes = [],
  editable = true,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [fileName, setFileName] = React.useState<string>("");

  // Parse allowed MIME types
  const getAllowedExtensions = (): string[] => {
    if (!allowedMimes || allowedMimes.length === 0) return [];

    return allowedMimes
      .map((mime: string) => {
        const parts = mime.split("/");
        if (parts.length === 2) {
          return parts[1]; // Get extension part (e.g., "pdf" from "application/pdf")
        }
        return mime;
      })
      .filter(Boolean);
  };

  const pickFile = async () => {
    if (!editable) return;

    try {
      setLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: allowedMimes && allowedMimes.length > 0 ? allowedMimes : "*/*",
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];

        // Validate file size (max 10MB)
        if (selectedFile.size && selectedFile.size > 10 * 1024 * 1024) {
          Alert.alert("Error", "File size exceeds 10MB limit");
          return;
        }

        const fileInfo = {
          uri: selectedFile.uri,
          type: selectedFile.mimeType || "application/octet-stream",
          name: selectedFile.name,
          size: selectedFile.size || 0,
        };

        setFileName(selectedFile.name);
        onValueChange(selectedFile.uri, fileInfo);
      }
    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert("Error", "Failed to pick file");
    } finally {
      setLoading(false);
    }
  };

  const allowedExtensions = getAllowedExtensions();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      {allowedExtensions.length > 0 && (
        <Text style={styles.supportedText}>
          Supported: {allowedExtensions.join(", ").toUpperCase()}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.fileButton,
          error && styles.fileError,
          !editable && styles.fileDisabled,
        ]}
        onPress={pickFile}
        disabled={!editable || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#2196F3" />
        ) : value ? (
          <View style={styles.fileInfo}>
            <Text style={styles.fileIcon}>📄</Text>
            <View style={styles.fileNameContainer}>
              <Text style={styles.fileName} numberOfLines={2}>
                {fileName || "File selected"}
              </Text>
              <Text style={styles.fileSize}>Tap to change</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>📁</Text>
            <Text style={styles.uploadText}>Tap to select file</Text>
          </View>
        )}
      </TouchableOpacity>

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
  supportedText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    fontStyle: "italic",
  },
  fileButton: {
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#f9f9f9",
    minHeight: 100,
    justifyContent: "center",
  },
  fileError: {
    borderColor: "red",
  },
  fileDisabled: {
    opacity: 0.6,
    backgroundColor: "#f5f5f5",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  fileNameContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: "#999",
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: "#999",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
