import CustomHeader from "@/src/components/CustomHeader";
import React, { FC } from "react";
import { StyleSheet, Text, View } from "react-native";

interface RegisterScreenProps {}

export const RegisterScreen: FC<RegisterScreenProps> = ({}) => {
  return (
    <View>
      <CustomHeader title="Register" hideLeftButton />
      <Text>RegisterScreen</Text>
    </View>
  );
};

const styles = StyleSheet.create({});
