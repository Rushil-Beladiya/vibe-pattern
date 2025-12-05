import FormManagementScreen from "@/src/features/superadmin/screens/FormManagementScreen";
import { Stack } from "expo-router";
import React from "react";

export default function FormManagementRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <FormManagementScreen />
    </>
  );
}
