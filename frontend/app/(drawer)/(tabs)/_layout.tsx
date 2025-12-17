import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import CustomHeader from "@/src/components/CustomHeader";
import { useDrawer } from "@/src/components/DrawerContext";
import { TabBar } from "@/src/components/TabBar";
import { fetchScreens, ScreenItem } from "@/src/services/screens";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";

export default function TabsLayout() {
  const { toggleDrawer } = useDrawer();

  const [screens, setScreens] = useState<ScreenItem[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await fetchScreens({ type: "bottom" });
      if (mounted && data && data.length) setScreens(data);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} screens={screens || undefined} />}
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
      {(screens || []).map((s) => (
        <Tabs.Screen
          key={s.route}
          name={s.route}
          options={{
            title: s.title,
            header: () => <CustomHeader title={s.title} />,
          }}
          initialParams={{ screen_id: s.id }}
        />
      ))}
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
});
