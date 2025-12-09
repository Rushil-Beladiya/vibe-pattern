import { useUser } from "@/src/context";
import { sendRequest } from "@/src/lib/api";
import { getStoreValue } from "@/src/utils/storage";
import { useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import { Platform, View } from "react-native";

// Function to compare semantic versions
const compareVersions = (
  currentVersion: string,
  minVersion: string
): boolean => {
  const current = currentVersion.split(".").map(Number);
  const minimum = minVersion.split(".").map(Number);

  for (let i = 0; i < Math.max(current.length, minimum.length); i++) {
    const currentPart = current[i] || 0;
    const minPart = minimum[i] || 0;

    if (currentPart > minPart) {
      return true;
    }
    if (currentPart < minPart) {
      return false;
    }
  }
  return true;
};

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  const handleCheckAppVersion = async () => {
    const response = await sendRequest({
      action: "version_check",
      method: "get",
    });
    console.log("response -> ", response);

    if (!response.success && !response.data) {
      router.replace("/(auth)/appversion");
      return;
    }

    const currentAppVersion = "1.0.0";
    console.log("currentAppVersion -> ", currentAppVersion);

    const isAndroid = Platform.OS === "android";
    const minRequiredVersion = isAndroid
      ? response.data.min_android_version
      : response.data.min_ios_version;

    console.log("minRequiredVersion -> ", minRequiredVersion);
    console.log("Platform -> ", Platform.OS);

    const isVersionCompatible = compareVersions(
      currentAppVersion,
      minRequiredVersion
    );
    console.log("isVersionCompatible -> ", isVersionCompatible);

    if (!isVersionCompatible) {
      console.log("Version mismatch - redirecting to appversion screen");
      router.replace("/(auth)/appversion");
      return;
    }

    const token = await getStoreValue({ key: "token", type: "string" });
    console.log("token -> ", token);

    if (!token || !user) {
      router.replace("/(auth)/login");
      return;
    }

    // Check role_id directly from user object
    console.log("User role_id -> ", user.role_id);

    // Convert to number if string
    const roleId =
      typeof user.role_id === "string"
        ? parseInt(user.role_id, 10)
        : user.role_id;

    if (roleId === 1) {
      console.log("Navigating to superadmin dashboard");
      router.replace("/(superadmin)/dashboard");
    } else if (roleId === 2 || roleId === 3) {
      console.log("Navigating to drawer tabs home");
      router.replace("/(drawer)/(tabs)/home");
    } else {
      console.log("Unknown role, redirecting to login");
      router.replace("/(auth)/login");
    }
  };

  useLayoutEffect(() => {
    // Wait for user context to load
    if (!isLoading) {
      handleCheckAppVersion();
    }
  }, [isLoading, user]);

  return <View />;
}
