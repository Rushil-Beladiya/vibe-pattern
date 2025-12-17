import { useUser } from "@/src/context";
import { AdminMusicScreen, UserMusicScreen } from "@/src/features/admin/Music";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";

export default function MusicTabScreen() {
  const { userRole } = useUser();
  const params = useLocalSearchParams();
  const screen_id = params.screen_id as string;

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      {userRole.admin ? <AdminMusicScreen /> : <UserMusicScreen />}
    </>
  );
}
