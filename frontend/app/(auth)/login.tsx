import { LoginScreen } from "@/src/features/auth/LoginScreen";
import { Stack } from "expo-router";
import React from "react";

export default function LoginRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <LoginScreen />
    </>
  );
}
