import React, { FC, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../theme";
import { isEmpty } from "../utils/helper";
import { Text, TextProps } from "./Text";

type ButtonType =
  | "secondary"
  | "primary"
  | "secondary_with_border"
  | "action_with_cancel"
  | "danger_with_border"
  | "danger"
  | "disable"
  | "text"
  | "custom";

interface ButtonStyleProps {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  loadingColor: string;
}

export interface ButtonProps {
  onPress?: () => void;
  onSecondaryPress?: () => void;
  title?: string;
  secondaryTitle?: string;
  loading?: boolean;
  secondaryLoading?: boolean;
  disable?: boolean;
  style?: ViewStyle;
  secondaryStyle?: ViewStyle;
  primaryStyle?: ViewStyle;
  type?: ButtonType;
  rightContent?: ReactNode;
  textStyle?: TextProps;
  backgroundColor?: string;
  width?: number;
  visible?: boolean;
}

export const Button: FC<ButtonProps> = ({
  onPress = () => {},
  onSecondaryPress = () => {},
  title = "",
  secondaryTitle = "Cancel",
  disable = false,
  loading = false,
  secondaryLoading = false,
  style,
  type = "primary",
  rightContent,
  secondaryStyle,
  primaryStyle,
  textStyle,
  backgroundColor,
  width = 50,
  visible = true,
}) => {
  const typeWiseStyle: Partial<Record<ButtonType, ButtonStyleProps>> = {
    secondary: {
      backgroundColor: colors.secondary,
      borderColor: colors.secondary,
      textColor: colors.white,
      loadingColor: colors.white,
    },
    secondary_with_border: {
      backgroundColor: "transparent",
      borderColor: colors.secondary,
      textColor: colors.secondary,
      loadingColor: colors.secondary,
    },
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      textColor: colors.white,
      loadingColor: colors.white,
    },
    danger_with_border: {
      backgroundColor: "transparent",
      borderColor: colors.red,
      textColor: colors.red,
      loadingColor: colors.red,
    },
    danger: {
      backgroundColor: colors.red,
      borderColor: colors.red,
      textColor: colors.white,
      loadingColor: colors.white,
    },
    disable: {
      backgroundColor: "#9CA3AF",
      borderColor: "#9CA3AF",
      textColor: colors.white,
      loadingColor: colors.white,
    },
  };

  const buttonDetails = typeWiseStyle[type as keyof typeof typeWiseStyle];

  const handleButtonContent = () => {
    switch (type) {
      case "primary":
      case "secondary":
      case "secondary_with_border":
      case "danger_with_border":
      case "danger":
      case "disable":
        return (
          <Pressable
            onPress={onPress}
            disabled={disable}
            style={{
              ...styles?.container,
              backgroundColor: buttonDetails?.backgroundColor,
              borderColor: buttonDetails?.borderColor,
              width: `${width}%`,
              ...(!isEmpty(backgroundColor) && {
                backgroundColor: backgroundColor,
              }),
              ...style,
            }}
          >
            {rightContent && rightContent}
            {loading && (
              <ActivityIndicator color={buttonDetails?.loadingColor} />
            )}
            <Text
              text={title}
              color="primary"
              {...textStyle}
              style={{ color: buttonDetails?.textColor }}
            />
          </Pressable>
        );
      case "text":
        return (
          <Pressable
            onPress={onPress}
            disabled={disable}
            style={{
              ...styles?.container,
              borderWidth: 0,
              width: `${width}%`,
              ...(!isEmpty(backgroundColor) && {
                backgroundColor: backgroundColor,
              }),
              ...style,
            }}
          >
            {rightContent && rightContent}
            {loading && (
              <ActivityIndicator color={buttonDetails?.loadingColor} />
            )}
            <Text
              text={title}
              style={{ color: buttonDetails?.textColor }}
              {...textStyle}
            />
          </Pressable>
        );
      case "custom":
        return (
          <Pressable
            onPress={onPress}
            disabled={disable}
            style={{
              ...styles?.container,
              borderWidth: 0,
              ...(!isEmpty(backgroundColor) && {
                backgroundColor: backgroundColor,
              }),
              ...style,
            }}
          >
            {rightContent && rightContent}
            {loading && (
              <ActivityIndicator color={buttonDetails?.loadingColor} />
            )}
            <Text text={title} weight="bold" {...textStyle} />
          </Pressable>
        );
      case "action_with_cancel":
        return (
          <View style={{ ...styles?.actionWithCancelContainer, ...style }}>
            <Pressable
              onPress={onSecondaryPress}
              disabled={disable}
              style={{
                ...styles?.container,
                width: "48%",
                backgroundColor:
                  typeWiseStyle["secondary_with_border"]?.backgroundColor,
                borderColor:
                  typeWiseStyle["secondary_with_border"]?.borderColor,
                ...secondaryStyle,
              }}
            >
              {rightContent && rightContent}
              {secondaryLoading && (
                <ActivityIndicator
                  color={typeWiseStyle["secondary_with_border"]?.loadingColor}
                />
              )}
              <Text
                text={secondaryTitle}
                style={{
                  color: typeWiseStyle["secondary_with_border"]?.textColor,
                }}
              />
            </Pressable>
            <Pressable
              onPress={onPress}
              disabled={disable}
              style={{
                ...styles?.container,
                width: "48%",
                backgroundColor: typeWiseStyle["secondary"]?.backgroundColor,
                borderColor: typeWiseStyle["secondary"]?.borderColor,
                ...primaryStyle,
              }}
            >
              {rightContent && rightContent}
              {loading && (
                <ActivityIndicator
                  color={typeWiseStyle["secondary"]?.loadingColor}
                />
              )}
              <Text
                text={title}
                style={{ color: typeWiseStyle["secondary"]?.textColor }}
                {...textStyle}
              />
            </Pressable>
          </View>
        );

      default:
        return null;
    }
  };

  return <View style={{}}>{handleButtonContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    borderWidth: 1,
  },
  actionWithCancelContainer: {
    flexDirection: "row",
    gap: 10,
    // backgroundColor: "red",
  },
});
