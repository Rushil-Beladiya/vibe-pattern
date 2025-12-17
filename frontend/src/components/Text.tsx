import React, { FC, ReactNode } from "react";
import {
  PixelRatio,
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  TextStyle,
} from "react-native";

export interface TextProps {
  text?: string;
  children?: ReactNode;
  style?: TextStyle;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  weight?: "light" | "regular" | "medium" | "bold";
  color?: "text" | "muted" | "primary" | "secondary" | "error";
  textProps?: RNTextProps;
  maxScale?: number;
}

export const Text: FC<TextProps> = ({
  children,
  text,
  style,
  size = "xs",
  weight = "regular",
  color = "text",
  maxScale = 1.6,
  textProps,
}) => {
  const content = text || children;

  const baseFontSize = 18;
  const systemScale = PixelRatio.getFontScale();
  const effectiveScale = Math.min(systemScale, maxScale);

  const modifiedStyle: TextStyle = {
    color: "",
    fontSize: baseFontSize * effectiveScale,
    fontWeight: "400",
    flexShrink: 1,
    ...style,
  };

  return (
    <RNText allowFontScaling={false} style={modifiedStyle} {...textProps}>
      {content}
    </RNText>
  );
};

const styles = StyleSheet.create({});
