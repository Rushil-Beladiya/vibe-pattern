import { FormEditScreen } from "@/src/features/superadmin";
import { Stack } from "expo-router";
import React from "react";

export default function FormEditRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <FormEditScreen />
    </>
  );
}
