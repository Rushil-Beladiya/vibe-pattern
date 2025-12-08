import FormBuilderScreen from "@/src/features/superadmin/screens/FormBuilderScreen";
import { Stack } from "expo-router";
import React from "react";

export default function FormBuilderRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <FormBuilderScreen />
    </>
  );
}
