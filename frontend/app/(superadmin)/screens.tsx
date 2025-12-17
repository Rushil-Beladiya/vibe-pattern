import { ScreenManagementScreen } from "@/src/features/superadmin";
import { Stack } from "expo-router";
import React from "react";

export default function ScreensRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ScreenManagementScreen />
    </>
  );
}
