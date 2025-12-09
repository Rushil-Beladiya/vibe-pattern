import React, {
  FC,
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Button,
  RefreshControl,
} from "react-native";
import {
  fetchMusicData,
  submitMusicData,
  type MusicData,
} from "@/src/services/musicService";
import FormRenderer from "@/src/features/tab/components/FormRenderer";
import { colors, spacing, typography } from "@/src/theme";

interface MusicScreenProps {
  screen_id?: string;
}

export const MusicScreen: FC<MusicScreenProps> = ({ screen_id }) => {
  const [data, setData] = useState<MusicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!screen_id) {
      setError("No screen_id provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedData = await fetchMusicData(screen_id);

      if (fetchedData) {
        setData(fetchedData);
      } else {
        setError("No data found for this screen");
      }
    } catch (err) {
      setError("Failed to load music data");
      console.error("MusicScreen error:", err);
    } finally {
      setLoading(false);
    }
  }, [screen_id]);

  useLayoutEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading music data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <Text style={styles.debugText}>Screen ID: {screen_id}</Text>
        <Button title="Retry" onPress={loadData} color={colors.primary} />
      </View>
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
        <Text style={styles.title}>Music Screen</Text>
        <Text style={styles.subtitle}>Screen ID: {screen_id}</Text>

        {data && (
          <View style={styles.dataContainer}>
            <Text style={styles.sectionTitle}>Music Information:</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>ID:</Text>
              <Text style={[styles.value, styles.darkValue]}>{data.id}</Text>
            </View>
            {data.title && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Title:</Text>
                <Text style={[styles.value, styles.darkValue]}>
                  {data.title}
                </Text>
              </View>
            )}
            {data.description && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Description:</Text>
                <Text style={[styles.value, styles.darkValue]}>
                  {data.description}
                </Text>
              </View>
            )}

            <FormRenderer
              fields={data.fields || []}
              onSubmit={async (values) => {
                setLoading(true);
                const res = await submitMusicData(
                  data.id || screen_id || 0,
                  values,
                  data.fields || []
                );
                setLoading(false);
                if (res.success) {
                  alert(res.message || "Submitted successfully");
                } else {
                  alert(res.message || "Submit failed");
                }
              }}
            />
          </View>
        )}
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
  errorText: {
    ...typography.h3,
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  debugText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
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
  dataContainer: {
    marginTop: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 8,
  },
  darkValue: {
    color: colors.black,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    ...typography.body,
    fontWeight: "600",
    color: colors.text,
    width: 120,
  },
  value: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
});
