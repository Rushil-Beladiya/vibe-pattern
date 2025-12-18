import { sendRequest } from "@/src/lib/api";
import React, { FC, useEffect } from "react";
import { Text, View } from "react-native";

export const UserProfileScreen: FC = () => {
  const fetchprofile = async () => {
    try {
      const response: any = await sendRequest({
        url: `user/submissions?screen_id=3`,
        method: "get",
      });
      const payload = response?.data ?? response;

      console.log("User Profile Data-> ", payload);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    fetchprofile();
  }, []);
  return (
    <View>
      <Text>UserProfileScreen</Text>
    </View>
  );
};
