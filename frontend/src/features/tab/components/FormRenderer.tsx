import React, { FC, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { colors, spacing, typography } from "@/src/theme";

type Field = any;

interface FormRendererProps {
  fields: Field[];
  onSubmit: (values: { [key: string]: any }) => Promise<void> | void;
}

export const FormRenderer: FC<FormRendererProps> = ({ fields, onSubmit }) => {
  const initial: { [key: string]: any } = {};
  fields.forEach((f) => (initial[f.key] = f.value ?? ""));

  const [values, setValues] = useState<{ [key: string]: any }>(initial);
  const [selectModal, setSelectModal] = useState<{
    visible: boolean;
    key?: string;
    options?: string[];
  }>({ visible: false });

  const handleChange = (key: string, val: any) => {
    setValues((s) => ({ ...s, [key]: val }));
  };

  const pickImage = async (key: string) => {
    // ensure native module exists
    if (
      !ImagePicker ||
      typeof ImagePicker.launchImageLibraryAsync !== "function"
    ) {
      Alert.alert(
        "Image picker not available",
        "Native module 'expo-image-picker' is not installed or the app needs rebuilding. Run `expo install expo-image-picker` and rebuild the app (or restart Expo with cache clear)."
      );
      return;
    }

    try {
      // request permissions where applicable
      try {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (perm.status !== "granted") {
          Alert.alert(
            "Permission denied",
            "Permission to access media library was denied."
          );
          return;
        }
      } catch (permErr) {
        // ignore permission API errors on web or older SDKs
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });
      // support both older and newer expo-image-picker shapes
      // older: { cancelled: false, uri }
      // newer: { canceled: false, assets: [{ uri, fileName? }] }
      const anyRes = res as any;
      const uri =
        anyRes.uri ||
        (anyRes.assets && anyRes.assets[0] && anyRes.assets[0].uri);
      const name =
        anyRes.name ||
        (anyRes.assets &&
          anyRes.assets[0] &&
          (anyRes.assets[0].fileName || anyRes.assets[0].name)) ||
        (uri ? uri.split("/").pop() : undefined);
      const canceled = anyRes.cancelled === true || anyRes.canceled === true;
      if (!canceled && uri) {
        handleChange(key, { uri, name });
      }
    } catch (err) {
      console.warn("Image picker error", err);
      Alert.alert("Image picker error", String(err));
    }
  };

  const pickFile = async (key: string, allowedMimes?: string[]) => {
    if (
      !DocumentPicker ||
      typeof DocumentPicker.getDocumentAsync !== "function"
    ) {
      Alert.alert(
        "File picker not available",
        "Native module 'expo-document-picker' is not installed or the app needs rebuilding. Run `expo install expo-document-picker` and rebuild the app (or restart Expo with cache clear)."
      );
      return;
    }

    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: allowedMimes && allowedMimes.length > 0 ? allowedMimes : "*/*",
      });

      const anyRes = res as any;
      const uri =
        anyRes.uri ||
        (anyRes.assets && anyRes.assets[0] && anyRes.assets[0].uri);
      const name =
        anyRes.name ||
        (anyRes.assets &&
          anyRes.assets[0] &&
          (anyRes.assets[0].name || anyRes.assets[0].fileName));
      const mimeType =
        anyRes.mimeType ||
        (anyRes.assets && anyRes.assets[0] && anyRes.assets[0].mimeType);
      const canceled =
        anyRes.type === "cancel" ||
        anyRes.type === "cancelled" ||
        anyRes.canceled === true ||
        anyRes.cancelled === true;
      if (!canceled && uri) {
        handleChange(key, { uri, name, mimeType });
      }
    } catch (err) {
      console.warn("Document picker error", err);
    }
  };

  const renderField = (f: Field, idx: number) => {
    const key = f.key || `field_${idx}`;
    const type = f.type || "text";
    const label = f.label || key;

    switch (type) {
      case "text":
      case "input":
        return (
          <View style={styles.field} key={key}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={String(values[key] ?? "")}
              onChangeText={(t) => handleChange(key, t)}
              placeholder={f.placeholder || ""}
            />
          </View>
        );

      case "textarea":
        return (
          <View style={styles.field} key={key}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={String(values[key] ?? "")}
              onChangeText={(t) => handleChange(key, t)}
              placeholder={f.placeholder || ""}
              multiline
            />
          </View>
        );

      case "select":
        return (
          <View style={styles.field} key={key}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
              style={styles.select}
              onPress={() =>
                setSelectModal({ visible: true, key, options: f.options || [] })
              }
            >
              <Text style={styles.selectText}>
                {values[key] || "Choose an option"}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "checkbox":
        return (
          <View style={styles.fieldRow} key={key}>
            <Text style={styles.label}>{label}</Text>
            <Switch
              value={!!values[key]}
              onValueChange={(v) => handleChange(key, v)}
            />
          </View>
        );

      case "image":
        return (
          <View style={styles.field} key={key}>
            <Text style={styles.label}>{label}</Text>
            <Button
              title={values[key]?.name ? "Change Image" : "Pick Image"}
              onPress={() => pickImage(key)}
              color={colors.primary}
            />
            {values[key]?.name ? (
              <Text style={styles.fileName}>{values[key].name}</Text>
            ) : null}
          </View>
        );

      case "file":
        return (
          <View style={styles.field} key={key}>
            <Text style={styles.label}>{label}</Text>
            <Button
              title={values[key]?.name ? "Change File" : "Pick File"}
              onPress={() => pickFile(key, f.allowed_mimes || [])}
              color={colors.primary}
            />
            {values[key]?.name ? (
              <Text style={styles.fileName}>{values[key].name}</Text>
            ) : null}
          </View>
        );

      case "date":
        return (
          <View style={styles.field} key={key}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={String(values[key] ?? "")}
              onChangeText={(t) => handleChange(key, t)}
              placeholder={f.placeholder || "YYYY-MM-DD"}
            />
          </View>
        );

      default:
        return (
          <View style={styles.field} key={key}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={String(values[key] ?? "")}
              onChangeText={(t) => handleChange(key, t)}
            />
          </View>
        );
    }
  };

  const submit = async () => {
    await onSubmit(values);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {fields.map((f: Field, i: number) => renderField(f, i))}

        <View style={styles.submitRow}>
          <Button title="Submit" onPress={submit} color={colors.primary} />
        </View>
      </ScrollView>

      <Modal visible={selectModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalInner}>
            <Text style={styles.modalTitle}>Choose an option</Text>
            {(selectModal.options || []).map((opt, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  handleChange(selectModal.key || "", opt);
                  setSelectModal({ visible: false });
                }}
                style={styles.optionButton}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
            <Button
              title="Cancel"
              onPress={() => setSelectModal({ visible: false })}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
  },
  field: {
    marginBottom: spacing.md,
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: 6,
    ...typography.body,
    color: colors.black,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  select: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: 6,
  },
  selectText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  fileName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  submitRow: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalInner: {
    width: Math.min(400, 320),
    backgroundColor: "#fff",
    padding: spacing.lg,
    borderRadius: 8,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  optionButton: {
    paddingVertical: spacing.sm,
  },
  optionText: {
    ...typography.body,
  },
});

export default FormRenderer;
