import { Button } from "@/src/components/Button";
import CustomHeader from "@/src/components/CustomHeader";
import { useToast } from "@/src/context/ToastContext";
import { sendRequest } from "@/src/lib/api";
import React, { FC, useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Screen = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  is_active: boolean;
  type: "bottom" | "sidedrawer";
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type FormData = {
  name: string;
  icon: string;
  type: "bottom" | "sidedrawer";
  is_active: boolean;
  sort_order: number;
};

export const ScreenManagementScreen: FC = () => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
  const [screenToDelete, setScreenToDelete] = useState<Screen | null>(null);
  const { showToast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    icon: "circle",
    type: "bottom",
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchScreens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch all screens
  const fetchScreens = async () => {
    setLoading(true);
    try {
      const response = await sendRequest({
        url: "super-admin/screens",
        method: "get",
      });
      console.log("response fetchscreen  -> ", response);
      if (response.success && response.data) {
        // Sort screens by sort_order before setting state
        const sortedScreens = (response.data as Screen[]).sort(
          (a, b) => a.sort_order - b.sort_order
        );
        setScreens(sortedScreens);
      }
    } catch (error) {
      console.error("Error fetching screens:", error);
      showToast?.({ type: "error", message: "Failed to fetch screens" });
    } finally {
      setLoading(false);
    }
  };

  // Create new screen
  const createScreen = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await sendRequest({
        url: "super-admin/screens",
        method: "post",
        data: { ...data, is_active: String(data.is_active) },
      });
      console.log("response createScreen -> ", response);

      if (response.success && response.data) {
        setScreens((prev) => [response.data as Screen, ...prev]);
        showToast?.({
          message: "Screen created successfully",
          type: "success",
        });
        setModalVisible(false);
        resetForm();
        await fetchScreens();
        return true;
      } else {
        showToast?.({
          message: response.message || "Failed to create screen",
          type: "error",
        });
        return false;
      }
    } catch (error) {
      console.error("Error creating screen:", error);
      showToast?.({ message: "Failed to create screen", type: "error" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update existing screen
  const updateScreen = async (screenId: number, data: FormData) => {
    setLoading(true);
    try {
      const response = await sendRequest({
        url: `super-admin/screens/${screenId}`,
        method: "patch",
        data: { ...data, is_active: String(data.is_active) },
      });
      console.log("response updateScreen -> ", response);
      if (response.success) {
        const updated = response.data
          ? (response.data as Screen)
          : { ...editingScreen!, ...data };
        setScreens((prev) => {
          const updatedScreens = prev.map((s) =>
            s.id === screenId ? updated : s
          );
          return updatedScreens.sort((a, b) => a.sort_order - b.sort_order);
        });
        showToast?.({
          message: "Screen updated successfully",
          type: "success",
        });
        setModalVisible(false);
        resetForm();
        return true;
      } else {
        showToast?.({
          message: response.message || "Failed to update screen",
          type: "error",
        });
        return false;
      }
    } catch (error) {
      console.error("Error updating screen:", error);
      showToast?.({ message: "Failed to update screen", type: "error" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete screen
  const deleteScreen = async (screen: Screen) => {
    setLoading(true);
    try {
      const response = await sendRequest({
        url: `super-admin/screens/${screen.id}`,
        method: "delete",
      });
      console.log("response deleteScreen -> ", response);

      if (response.success) {
        setScreens((prev) => prev.filter((s) => s.id !== screen.id));
        showToast?.({
          message: "Screen deleted successfully",
          type: "success",
        });
        setDeleteModalVisible(false);
        setScreenToDelete(null);
        await fetchScreens();
        return true;
      } else {
        showToast?.({
          message: response.message || "Failed to delete screen",
          type: "error",
        });
        return false;
      }
    } catch (error) {
      console.error("Error deleting screen:", error);
      showToast?.({ message: "Failed to delete screen", type: "error" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      icon: "circle",
      type: "bottom",
      is_active: true,
      sort_order: 0,
    });
    setEditingScreen(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (screen: Screen) => {
    setEditingScreen(screen);
    setFormData({
      name: screen.name,
      icon: screen.icon,
      type: screen.type,
      is_active: screen.is_active,
      sort_order: screen.sort_order,
    });
    setModalVisible(true);
  };

  const openDeleteModal = (screen: Screen) => {
    setScreenToDelete(screen);
    setDeleteModalVisible(true);
  };

  const handleSaveScreen = async () => {
    if (!formData.name.trim()) {
      showToast?.({ type: "error", message: "Screen name is required" });
      return;
    }

    if (editingScreen) {
      await updateScreen(editingScreen.id, formData);
    } else {
      await createScreen(formData);
    }
  };

  const handleConfirmDelete = async () => {
    if (screenToDelete) {
      await deleteScreen(screenToDelete);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title="Screen Management" showBackButton />

      <FlatList
        data={screens}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <View style={styles.screenCard}>
            <View style={styles.screenInfo}>
              <Text style={styles.screenName}>{item.name}</Text>
              <Text style={styles.screenType}>
                {item.type} • {item.is_active ? "Active" : "Inactive"} • Sort
                Order: {item.sort_order}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, styles.editBtn]}
                onPress={() => openEditModal(item)}
              >
                <Text style={styles.btnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.deleteBtn]}
                onPress={() => openDeleteModal(item)}
              >
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: "#666" }}>No screens available</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingScreen ? "Edit Screen" : "New Screen"}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.modalBody}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 32 }}
                >
                  <Text style={styles.label}>Screen Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Music"
                    value={formData.name}
                    onChangeText={(text) =>
                      setFormData({ ...formData, name: text })
                    }
                  />

                  <Text style={styles.label}>Type *</Text>
                  <View style={styles.typeGroup}>
                    {["bottom", "sidedrawer"].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeBtn,
                          formData.type === type && styles.typeBtnActive,
                        ]}
                        onPress={() =>
                          setFormData({
                            ...formData,
                            type: type as "bottom" | "sidedrawer",
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.typeBtnText,
                            formData.type === type && styles.typeBtnTextActive,
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Active</Text>
                  <View style={styles.toggleGroup}>
                    {[true, false].map((val) => (
                      <TouchableOpacity
                        key={String(val)}
                        style={[
                          styles.typeBtn,
                          formData.is_active === val && styles.typeBtnActive,
                        ]}
                        onPress={() =>
                          setFormData({ ...formData, is_active: val })
                        }
                      >
                        <Text
                          style={[
                            styles.typeBtnText,
                            formData.is_active === val &&
                              styles.typeBtnTextActive,
                          ]}
                        >
                          {val ? "Yes" : "No"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Sort Order</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 1"
                    value={String(formData.sort_order)}
                    onChangeText={(text) =>
                      setFormData({
                        ...formData,
                        sort_order: parseInt(text) || 0,
                      })
                    }
                    keyboardType="numeric"
                  />

                  <View style={{ marginTop: 24 }}>
                    <Button
                      type="action_with_cancel"
                      title="Save"
                      secondaryTitle="Cancel"
                      onPress={handleSaveScreen}
                      onSecondaryPress={() => setModalVisible(false)}
                      loading={loading}
                    />
                  </View>
                </ScrollView>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Delete Screen</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete &quot;{screenToDelete?.name}
              &quot;? This action cannot be undone.
            </Text>

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.deleteModalBtn, styles.cancelBtn]}
                onPress={() => setDeleteModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.deleteModalBtn,
                  styles.confirmDeleteBtn,
                  loading && styles.btnDisabled,
                ]}
                onPress={handleConfirmDelete}
                disabled={loading}
              >
                <Text style={styles.confirmDeleteBtnText}>
                  {loading ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12, paddingBottom: 80 },
  screenCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  screenInfo: { flex: 1 },
  screenName: { fontSize: 16, fontWeight: "600" },
  screenType: { color: "#666", marginTop: 4, fontSize: 12 },
  actions: { flexDirection: "row", gap: 8 },
  btn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  editBtn: { backgroundColor: "#461053" },
  deleteBtn: { backgroundColor: "#d32f2f" },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#461053",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabIcon: { fontSize: 32, color: "#fff" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  closeBtn: { fontSize: 24, color: "#666" },
  modalBody: { padding: 16 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  typeGroup: { flexDirection: "row", gap: 10 },
  toggleGroup: { flexDirection: "row", gap: 10 },
  typeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
  },
  typeBtnActive: { backgroundColor: "#461053", borderColor: "#461053" },
  typeBtnText: { color: "#666", fontWeight: "600" },
  typeBtnTextActive: { color: "#fff" },

  // Delete Modal
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  deleteModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    elevation: 5,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  deleteModalMessage: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  deleteModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelBtnText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
  confirmDeleteBtn: {
    backgroundColor: "#d32f2f",
  },
  confirmDeleteBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
