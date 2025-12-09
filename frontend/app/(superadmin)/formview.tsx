import { Stack } from "expo-router";
import React from "react";
import { FormViewScreen } from "@/src/features/superadmin/screens/FormViewScreen";

export default function FormViewRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <FormViewScreen />
    </>
  );
}
