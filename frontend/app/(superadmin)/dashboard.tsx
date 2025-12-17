import { SuperAdminDashboardScreen } from "@/src/features/superadmin";
import { Stack } from "expo-router";
import React from "react";

export default function FormDashboardRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <SuperAdminDashboardScreen />
    </>
  );
}
