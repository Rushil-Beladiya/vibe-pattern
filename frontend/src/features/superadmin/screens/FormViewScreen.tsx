import React, { useMemo } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Switch,
} from "react-native";
import CustomHeader from "@/src/components/CustomHeader";

type Field = {
  key: string;
  label: string;
  type: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  value?: any;
};

type Form = {
  id: number;
  name: string;
  screen: any;
  fields: Field[];
  created_at?: string;
  updated_at?: string;
};

export default function FormViewScreen() {
  const params = useLocalSearchParams();
  const formParam = params?.form as string | undefined;
  const router = useRouter();

  const form: Form | null = useMemo(() => {
    if (!formParam) return null;
    try {
      const raw = formParam;
      if (raw.startsWith("%7B") || raw.startsWith("%22%7B")) {
        return JSON.parse(decodeURIComponent(raw));
      }
      if (raw.startsWith("{")) {
        return JSON.parse(raw);
      }
      try {
        return JSON.parse(decodeURIComponent(raw));
      } catch (err) {
        return null;
      }
    } catch (e) {
      return null;
    }
  }, [formParam]);

  if (!form) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#666" }}>No form data provided.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ color: "#fff" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const headerImageField = form.fields?.find(
    (f) => f.type === "image" || f.key === "cover_image"
  );

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title="Form View" showBackButton />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 16 }}
      >
        <View style={styles.header}>
          {headerImageField ? (
            <Image
              source={{
                uri:
                  headerImageField.value ||
                  "https://via.placeholder.com/600x200?text=Cover",
              }}
              style={styles.cover}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cover, styles.coverPlaceholder]}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {form.name}
              </Text>
            </View>
          )}
          <Text style={styles.formName}>{form.name}</Text>
          <Text style={styles.screenName}>{form.screen?.name ?? ""}</Text>
        </View>

        <View style={{ marginTop: 12 }}>
          {form.fields.map((field) => (
            <View style={styles.fieldRow} key={field.key}>
              <Text style={styles.fieldLabel}>
                {field.label}
                {field.required ? " *" : ""}
              </Text>

              {field.type === "text" && (
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder ?? ""}
                  defaultValue={field.value ?? ""}
                />
              )}

              {field.type === "textarea" && (
                <TextInput
                  style={[styles.input, { minHeight: 100 }]}
                  placeholder={field.placeholder ?? ""}
                  defaultValue={field.value ?? ""}
                  multiline
                />
              )}

              {field.type === "select" && (
                <View style={styles.selectBox}>
                  {field.options?.map((opt) => (
                    <View key={opt} style={styles.optionRow}>
                      <Text style={{ color: "#222" }}>{opt}</Text>
                    </View>
                  ))}
                </View>
              )}

              {field.type === "checkbox" && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Switch value={!!field.value} />
                </View>
              )}

              {field.type === "date" && (
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder ?? "YYYY-MM-DD"}
                  defaultValue={field.value ?? ""}
                />
              )}

              {field.type === "image" && (
                <Image
                  source={{
                    uri:
                      field.value ||
                      "https://via.placeholder.com/150?text=Image",
                  }}
                  style={styles.thumb}
                />
              )}

              {field.type === "file" && (
                <TouchableOpacity style={styles.fileBtn}>
                  <Text style={{ color: "#fff" }}>Open File Picker</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { marginBottom: 8 },
  cover: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  coverPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#461053",
  },
  formName: { fontSize: 20, fontWeight: "700", marginTop: 12 },
  screenName: { color: "#666", marginTop: 4 },
  fieldRow: { marginBottom: 12 },
  fieldLabel: { fontWeight: "600", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  optionRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#f2f2f2",
  },
  thumb: { width: 120, height: 80, borderRadius: 6, marginTop: 6 },
  fileBtn: {
    backgroundColor: "#461053",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: {
    marginTop: 12,
    backgroundColor: "#461053",
    padding: 10,
    borderRadius: 6,
  },
});

export { FormViewScreen };
