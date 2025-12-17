import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { imageUrl } from "../lib/api";
import { ScreenItem } from "../services/screens";
import { colors, spacing } from "../theme";

type TabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
  screens?: ScreenItem[];
};

export const TabBar = ({
  state,
  descriptors,
  navigation,
  screens,
}: TabBarProps) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route: any, idx: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === idx;
        const tab = screens?.find((t) => t.route === route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
          >
            {typeof tab?.icon === "string" ? (
              <Image
                source={{
                  uri:
                    tab.icon.startsWith("http") || tab.icon.startsWith("https")
                      ? tab.icon
                      : imageUrl() + tab.icon.replace(/^\/(storage\/)?/, ""),
                }}
                style={[styles.iconImage, isFocused && styles.iconActive]}
                resizeMode="contain"
              />
            ) : (
              <Text style={[styles.icon, isFocused && styles.iconActive]}>
                {" "}
                {tab?.icon}
              </Text>
            )}
            <Text style={[styles.label, isFocused && styles.labelActive]}>
              {tab?.title || options.title || route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  iconImage: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  iconActive: {
    transform: [{ scale: 1.1 }],
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.white,
    fontWeight: "600",
  },
});
