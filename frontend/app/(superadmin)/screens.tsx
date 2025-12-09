import { Stack } from "expo-router";
import React from "react";
import ScreenManagementScreen from "@/src/features/superadmin/screens/ScreenManagementScreen";

export default function ScreensRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ScreenManagementScreen />
    </>
  );
}
