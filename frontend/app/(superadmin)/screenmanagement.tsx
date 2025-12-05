import ScreenManagementScreen from "@/src/features/superadmin/screens/ScreenManagementScreen";
import { Stack } from "expo-router";
import React from "react";

export default function ScreenManagementRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ScreenManagementScreen />
    </>
  );
}
