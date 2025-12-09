import { useUser } from "@/src/context";
import { MusicScreen } from "@/src/features/tab/screens/music/MusicScreen";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";

export default function MusicTabScreen() {
  const { userRole } = useUser();
  const params = useLocalSearchParams();
  const screen_id = params.screen_id as string;

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      {userRole.admin ? <MusicScreen screen_id={screen_id} /> : null}
    </>
  );
}
