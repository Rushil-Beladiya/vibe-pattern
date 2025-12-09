import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

interface ScreenWrapperProps {
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  children: React.ReactNode;
  style?: any;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  loading = false,
  refreshing = false,
  onRefresh,
  children,
  style,
}) => {
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#461053" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, style]}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
});
