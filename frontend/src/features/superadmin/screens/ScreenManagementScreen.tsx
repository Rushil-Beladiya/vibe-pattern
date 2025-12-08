import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import screenService, { Screen } from "@/src/services/screenService";
import { colors } from "@/src/theme";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScreenManagementScreen() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
  const [name, setName] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchScreens();
  }, []);

  const fetchScreens = async () => {
    try {
      setIsLoading(true);
      const data = await screenService.getAllScreens();
      setScreens(data);
    } catch (error: any) {
      showToast({
        message: error.response?.data?.message || "Failed to fetch screens",
        type: "error",
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchScreens();
  };

  const handleAddScreen = () => {
    setEditingScreen(null);
    setName("");
    setDisplayOrder("");
    setShowAddModal(true);
  };

  const handleEditScreen = (screen: Screen) => {
    setEditingScreen(screen);
    setName(screen.name);
    setDisplayOrder(screen.display_order.toString());
    setShowAddModal(true);
  };

  const handleSaveScreen = async () => {
    if (!name.trim()) {
      showToast({ message: "Screen name is required", type: "error" });
      return;
    }

    if (!displayOrder.trim() || isNaN(Number(displayOrder))) {
      showToast({ message: "Valid display order is required", type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      if (editingScreen) {
        await screenService.updateScreen(editingScreen.id, {
          name: name.trim(),
          display_order: Number(displayOrder),
        });
        showToast({ message: "Screen updated successfully", type: "success" });
      } else {
        await screenService.createScreen({
          name: name.trim(),
          display_order: Number(displayOrder),
        });
        showToast({ message: "Screen created successfully", type: "success" });
      }
      setShowAddModal(false);
      fetchScreens();
    } catch (error: any) {
      showToast({
        message: error.response?.data?.message || "Failed to save screen",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteScreen = (screen: Screen) => {
    Alert.alert(
      "Delete Screen",
      `Are you sure you want to delete "${screen.name}"? This will also delete all associated forms.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await screenService.deleteScreen(screen.id);
              showToast({
                message: "Screen deleted successfully",
                type: "success",
              });
              fetchScreens();
            } catch (error: any) {
              showToast({
                message:
                  error.response?.data?.message || "Failed to delete screen",
                type: "error",
              });
            }
          },
        },
      ]
    );
  };

  const renderScreen = ({ item }: { item: Screen }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.screenName}>{item.name}</Text>
          <Text style={styles.screenMeta}>Order: {item.display_order}</Text>
          <Text style={styles.screenMeta}>Forms: {item.forms_count || 0}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => handleEditScreen(item)}
          >
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDeleteScreen(item)}
          >
            <Text style={styles.actionBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading screens...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Screen Management</Text>
        <View style={{ width: 60 }} />
      </View>

      {showAddModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingScreen ? "Edit Screen" : "Add New Screen"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Screen Name (e.g., Home, Profile)"
              value={name}
              onChangeText={setName}
              editable={!isSaving}
            />

            <TextInput
              style={styles.input}
              placeholder="Display Order (e.g., 1, 2, 3)"
              value={displayOrder}
              onChangeText={setDisplayOrder}
              keyboardType="number-pad"
              editable={!isSaving}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowAddModal(false)}
                disabled={isSaving}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleSaveScreen}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                    {editingScreen ? "Update" : "Create"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={screens}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderScreen}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No screens yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first screen to get started
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddScreen}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  screenName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  screenMeta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editBtn: {
    backgroundColor: colors.primary,
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  modal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: colors.text,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: colors.border,
  },
  saveBtn: {
    backgroundColor: colors.primary,
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
  },
});
