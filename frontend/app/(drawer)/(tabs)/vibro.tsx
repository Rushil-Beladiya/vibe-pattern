import { useUser } from "@/src/context";
import { AdminVibroScreen } from "@/src/features/admin/Vibro";
import UserVibroScreen from "@/src/features/admin/Vibro/UserVibroScreen";

import { Stack } from "expo-router";
import React from "react";

export default function VibroRoute() {
  const { userRole } = useUser();

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      {userRole.admin ? <AdminVibroScreen /> : <UserVibroScreen />}
    </>
  );
}
