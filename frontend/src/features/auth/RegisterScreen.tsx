import CustomHeader from "@/src/components/CustomHeader";
import React, { FC } from "react";
import { Text, View } from "react-native";

export const RegisterScreen: FC = () => {
  return (
    <View>
      <CustomHeader title="Register" hideLeftButton />
      <Text>RegisterScreen</Text>
    </View>
  );
};
