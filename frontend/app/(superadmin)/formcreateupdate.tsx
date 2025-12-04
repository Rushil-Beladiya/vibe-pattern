import { FormCreateUpdateScreen } from "@/src/features/superadmin/screens/FormCreateUpdateScreen";
import { Stack } from "expo-router";
import React from "react";

export default function FormCreateRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <FormCreateUpdateScreen />
    </>
  );
}
