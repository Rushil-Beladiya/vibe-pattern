import { Stack } from "expo-router";
import React from "react";
import { FormCreateScreen } from "@/src/features/superadmin/screens/FormCreateScreen";

export default function FormCreateRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <FormCreateScreen />
    </>
  );
}
