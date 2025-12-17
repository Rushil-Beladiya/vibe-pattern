import { useUser } from "@/src/context";
import { AdminVibroScreen, UserVibroScreen } from "@/src/features/admin/Vibro";

import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";

export default function VibroRoute() {
  const { userRole } = useUser();
  const params = useLocalSearchParams();
  const screen_id = params.screen_id as string;

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      {userRole.admin ? <AdminVibroScreen /> : <UserVibroScreen />}
    </>
  );
}
