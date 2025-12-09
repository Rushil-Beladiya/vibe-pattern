import { Stack } from "expo-router";
import React from "react";
import { FormEditScreen } from "@/src/features/superadmin/screens/FormEditScreen";

export default function FormEditRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <FormEditScreen />
    </>
  );
}
