import React, { FC, useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { sendRequest } from "@/src/lib/api";
import FormRenderer from "@/src/features/tab/components/FormRenderer";
import { colors, spacing, typography } from "@/src/theme";

interface Field {
  key: string;
  label: string;
  type: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  value?: any;
}

type FormData = {
  id: number;
  name: string;
  screen: any;
  fields: Field[];
};

interface ProfileScreenProps {
  screen_id?: string;
}

export const ProfileScreen: FC<ProfileScreenProps> = ({ screen_id }) => {
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!screen_id) {
      setForm(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await sendRequest({
        url: `admin/forms/${screen_id}`,
        method: "get",
      });
      if (res.success && res.data) {
        setForm(res.data as FormData);
      } else {
        setForm(null);
      }
    } catch (err) {
      console.error("ProfileScreen load error:", err);
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [screen_id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!form) {
    return (
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>
            No form available for this screen.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>{form.name}</Text>
        <Text style={styles.subtitle}>{form.screen?.name ?? ""}</Text>

        <FormRenderer
          fields={form.fields || []}
          onSubmit={async (values) => {
            try {
              const payload = {
                fields: form.fields.map((f) => ({
                  ...f,
                  value: values[f.key],
                })),
              };
              const res = await sendRequest({
                url: `admin/forms/${form.id}/store`,
                method: "post",
                data: payload,
              });
              if (res.success) {
                Alert.alert(
                  "Success",
                  res.message || "Profile submitted successfully"
                );
                loadData();
              } else {
                Alert.alert("Error", res.message || "Failed to submit");
              }
            } catch (err) {
              console.error("Profile submit error:", err);
              Alert.alert(
                "Error",
                "An error occurred while submitting the profile"
              );
            }
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
});
