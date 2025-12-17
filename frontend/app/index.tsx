import { useUser } from "@/src/context";
import { sendRequest } from "@/src/lib/api";
import { getStoreValue } from "@/src/utils/storage";
import { useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import { Platform, StyleSheet } from "react-native";

export default function Index() {
  const app_min_android_version = "1.0.1";
  const app_min_ios_version = "1.0.1";
  const { setUser } = useUser();
  const router = useRouter();

  useLayoutEffect(() => {
    handleCheckAppVersion();
  }, []);

  const handleCheckAppVersion = async () => {
    const response = await sendRequest({
      url: `app-version`,
      method: "get",
    });
    console.log("response App version Cheacking-> ", response);
    if (!response.success || !response.data) {
      router.replace("/(auth)/appversion");
      return;
    }

    const apiIosVersion = response.data.min_ios_version;
    const apiAndroidVersion = response.data.min_android_version;

    if (Platform.OS === "ios") {
      if (!apiIosVersion || apiIosVersion !== app_min_ios_version) {
        router.replace("/(auth)/appversion");
        return;
      }
    } else if (Platform.OS === "android") {
      if (!apiAndroidVersion || apiAndroidVersion !== app_min_android_version) {
        router.replace("/(auth)/appversion");
        return;
      }
    } else {
      router.replace("/(auth)/appversion");
      return;
    }

    const token = await getStoreValue({ key: "token", type: "string" });
    const user = await getStoreValue({ key: "user", type: "any" });

    if (!token || !user) {
      router.replace("/(auth)/register");
      return;
    }

    const roleId =
      typeof user.role_id === "string"
        ? parseInt(user.role_id, 10)
        : user.role_id;

    if (roleId === 1) {
      console.log("Navigating to superadmin dashboard");
      router.replace("/(superadmin)/dashboard");
    } else if (roleId === 2 || roleId === 3) {
      router.replace("/(drawer)/(tabs)/music");
    } else {
      console.log("Unknown role, redirecting to login");
      router.replace("/(auth)/login");
    }
  };
}

const styles = StyleSheet.create({});
