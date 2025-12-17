import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../theme";
import { tabItems } from "../constants/menu";

type TabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

export const TabBar = ({ state, descriptors, navigation }: TabBarProps) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route: any, idx: number) => {
        const isFocused = state.index === idx;
        const tab = tabItems.find((t) => t.name === route.name);

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
            style={[styles.tab, isFocused && styles.tabActive]}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            activeOpacity={0.85}
          >
            <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
              <Text style={[styles.icon, isFocused && styles.iconActive]}>
                {tab?.icon}
              </Text>
            </View>

            <Text
              style={[
                styles.label,
                isFocused ? styles.labelActive : styles.labelInactive,
              ]}
            >
              {tab?.label || route.name}
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
  tabActive: {
    backgroundColor: colors.surfaceLight,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconWrapActive: {
    backgroundColor: colors.primaryLight,
  },
  icon: {
    fontSize: 20,
  },
  iconActive: {
    color: colors.primary,
    transform: [{ scale: 1.08 }],
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
  labelInactive: {
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: "600",
  },
});
