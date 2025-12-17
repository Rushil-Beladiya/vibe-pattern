import { useUser } from "@/src/context";
import {
  AdminProfileScreen,
  UserProfileScreen,
} from "@/src/features/admin/Profile";

import { Stack } from "expo-router";
import React from "react";

export default function ProfilRoute() {
  const { userRole } = useUser();

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      {userRole.admin ? <AdminProfileScreen /> : <UserProfileScreen />}
    </>
  );
}
