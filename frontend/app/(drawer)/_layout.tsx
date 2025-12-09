import CustomHeader from "@/src/components/CustomHeader";
import { useDrawer } from "@/src/components/DrawerContext";
import { Stack } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { fetchScreens, ScreenItem } from "@/src/services/screens";

export default function DrawerLayout() {
  const { toggleDrawer } = useDrawer();

  const [screens, setScreens] = useState<ScreenItem[] | null>(null);

  useLayoutEffect(() => {
    let mounted = true;
    (async () => {
      const data = await fetchScreens({ type: "sidedrawer" });
      if (mounted && data && data.length) setScreens(data);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Stack
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
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {(screens || []).map((s) => (
        <Stack.Screen
          key={s.route}
          name={s.route}
          options={{
            title: s.title,
            header: () => <CustomHeader title={s.title} showBackButton />,
          }}
          initialParams={{ screen_id: s.id }}
        />
      ))}
    </Stack>
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
