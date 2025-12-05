import UserFormViewScreen from "@/src/features/drawer/screens/UserFormViewScreen";
import { Stack } from "expo-router";
import React from "react";

export default function UserFormViewRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <UserFormViewScreen />
    </>
  );
}
