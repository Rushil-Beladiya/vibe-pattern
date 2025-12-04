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
  const { userRole } = useUser();

  const handleCheckAppVersion = async () => {
    const response = await sendRequest({
      action: "version_check",
      method: "get",
    });
    console.log("response -> ", response);

    if (!response.success && !response.data) {
      router.replace("/(auth)/appversion");
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

    if (!token) {
      router.replace("/(auth)/login");
      return;
    }

    switch (true) {
      case userRole.superadmin:
        router.replace("/(superadmin)/dashboard");
        break;
      case userRole.admin:
        router.replace("/(drawer)/(tabs)/home");
        break;
      default:
        router.replace("/(auth)/login");
    }
  };

  useLayoutEffect(() => {
    handleCheckAppVersion();
  }, []);

  return <View />;
}
