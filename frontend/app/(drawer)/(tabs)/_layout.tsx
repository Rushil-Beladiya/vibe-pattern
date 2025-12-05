import { Tabs } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";

import CustomHeader from "@/src/components/CustomHeader";
import { useDrawer } from "@/src/components/DrawerContext";
import { TabBar } from "@/src/components/TabBar";
import { useAuth } from "@/src/context/AuthContext";
import screenService, { Screen } from "@/src/services/screenService";
import AdminFormListScreen from "@/src/features/drawer/screens/AdminFormListScreen";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";

export default function TabsLayout() {
  const { toggleDrawer } = useDrawer();
  const { user, isAuthenticated } = useAuth();
  const [screens, setScreens] = useState<Screen[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchScreens();
    }
  }, [isAuthenticated, user]);

  const fetchScreens = async () => {
    try {
      setIsLoading(true);
      const data = await screenService.getAllScreens();
      setScreens(data.sort((a, b) => a.display_order - b.display_order));
    } catch (error) {
      console.error("Failed to fetch screens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading screens...</Text>
      </View>
    );
  }

  // If no screens, show default tabs
  if (screens.length === 0) {
    return (
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          ),
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            header: () => <CustomHeader title="Home" />,
          }}
        />
        <Tabs.Screen
          name="vibro"
          options={{
            title: "vibro",
            header: () => <CustomHeader title="Vibro" />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            header: () => <CustomHeader title="Profile" />,
          }}
        />
      </Tabs>
    );
  }

  // Dynamic tabs based on screens from API
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerLeft: () => (
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        ),
      }}
    >
      {screens.map((screen) => (
        <Tabs.Screen
          key={screen.id}
          name={screen.name.toLowerCase().replace(/\s+/g, "-")}
          options={{
            title: screen.name,
            header: () => <CustomHeader title={screen.name} />,
          }}
        >
          {() => (
            <AdminFormListScreen
              screenId={screen.id}
              screenName={screen.name}
            />
          )}
        </Tabs.Screen>
      ))}

      {/* Keep profile tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          header: () => <CustomHeader title="Profile" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  menuBtn: {
    paddingHorizontal: spacing.md,
  },
  menuIcon: {
    fontSize: 24,
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
