import FormFillScreen from "@/src/features/drawer/screens/FormFillScreen";
import { Stack } from "expo-router";
import React from "react";

export default function FormFillRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FormFillScreen />
    </>
  );
}
