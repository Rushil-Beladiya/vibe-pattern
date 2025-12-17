import { useUser } from "@/src/context";
import { AdminMusicScreen, UserMusicScreen } from "@/src/features/admin/Music";
import { Stack } from "expo-router";
import React from "react";

export default function MusicTabScreen() {
  const { userRole } = useUser();

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      {userRole.admin ? <AdminMusicScreen /> : <UserMusicScreen />}
    </>
  );
}
