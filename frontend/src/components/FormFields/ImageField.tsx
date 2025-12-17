import React, { FC } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

interface ImageFieldProps {
  label?: string;
  value?: string;
  onValueChange: (value: string, file?: any) => void;
  required?: boolean;
  error?: string;
  editable?: boolean;
}

export const ImageField: FC<ImageFieldProps> = ({
  label,
  value = "",
  onValueChange,
  required = false,
  error,
  editable = true,
}) => {
  const [loading, setLoading] = React.useState(false);

  const pickImage = async () => {
    if (!editable) return;

    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        const uri = selectedImage.uri;

        // Pass both preview URI and file info
        const fileInfo = {
          uri: selectedImage.uri,
          type: "image/jpeg",
          name: selectedImage.uri.split("/").pop() || `image_${Date.now()}.jpg`,
          size: selectedImage.fileSize || 0,
        };

        onValueChange(uri, fileInfo);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    } finally {
      setLoading(false);
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
          styles.imageButton,
          error && styles.imageError,
          !editable && styles.imageDisabled,
        ]}
        onPress={pickImage}
        disabled={!editable || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#2196F3" />
        ) : value ? (
          <View style={styles.imagePreview}>
            <Image
              source={{ uri: value }}
              style={styles.image}
              resizeMode="cover"
            />
            <Text style={styles.changeText}>Change Image</Text>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>📷</Text>
            <Text style={styles.uploadText}>Tap to select image</Text>
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
  imageButton: {
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
    minHeight: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  imageError: {
    borderColor: "red",
  },
  imageDisabled: {
    opacity: 0.6,
    backgroundColor: "#f5f5f5",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  changeText: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    padding: 8,
    borderRadius: 4,
    fontSize: 12,
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderText: {
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
