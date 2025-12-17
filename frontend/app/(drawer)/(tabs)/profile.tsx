import { useUser } from "@/src/context";
import {
  AdminProfileScreen,
  UserProfileScreen,
} from "@/src/features/admin/Profile";

import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";

export default function ProfilRoute() {
  const { userRole } = useUser();
  const params = useLocalSearchParams();
  const screen_id = params.screen_id as string;

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      {userRole.admin ? <AdminProfileScreen /> : <UserProfileScreen />}
    </>
  );
}
