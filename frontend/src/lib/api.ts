import axios, { AxiosRequestConfig } from "axios";
import { router } from "expo-router";
import { isEmpty } from "../utils/helper";
import { clearStore, getStoreValue } from "../utils/storage";

// const baseUrl = "";
const baseUrl = "http://192.168.0.102:8000/";
const apiUrl = baseUrl + "api/";

export const imageUrl = () => `${baseUrl}storage/`;
const TIMEOUT = 30000;

export const apiActions = {
  login: "login",
  register: "register",
  logout: "logout",
  version_check: "app-version",
};

export const api = {
  get login() {
    return `${apiUrl}login`;
  },
  get register() {
    return `${apiUrl}register`;
  },
  get logout() {
    return `${apiUrl}logout`;
  },
  getallForms() {
    return `${apiUrl}forms`;
  },
  formCreate() {
    return `${apiUrl}forms/create-form`;
  },
  formUpdate(id: number | string) {
    return `${apiUrl}forms/${id}`;
  },
  formDelete(id: number | string) {
    return `${apiUrl}forms/${id}`;
  },
  getById(id: number | string) {
    return `${apiUrl}forms/${id}`;
  },
};

const apiClient = axios.create({
  baseURL: apiUrl,
  timeout: TIMEOUT,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await getStoreValue({ key: "token" });
    if (!isEmpty(token)) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error adding token:", error);
  }
  return config;
});

const handleError = (response: any) => {
  if (response?.message === "Unauthenticated.") {
    clearStore();
    router.replace("/(auth)/login");
  }
};

export const sendRequest = async ({
  method = "post",
  url,
  data,
  headers,
  action = "login",
}: {
  method?: "get" | "post" | "put" | "delete" | "patch";
  url?: string;
  data?: any;
  headers?: any;
  action?: keyof typeof apiActions;
}) => {
  try {
    const requestConfig: AxiosRequestConfig = {
      method,
      url: url || apiActions[action],
      data,
      headers,
    };
    console.log("Request Config Api-> ", requestConfig);

    const response = await apiClient.request(requestConfig);

    console.log("Response Api-> ", response);

    if (response?.status === 200 || response?.status === 201) {
      return {
        success: true,
        message: response.data.message,
        error: "",
        data: response.data?.data || null,
      };
    }

    return {
      success: false,
      message: response?.data?.message || "Unexpected error occurred",
      data: null,
    };
  } catch (error: any) {
    const errorData = error?.response?.data || {};

    handleError(errorData);
    return {
      success: false,
      message:
        errorData?.message || errorData?.responseText || "Something went wrong",
      error: errorData?.errors || {},
      data: null,
    };
  }
};
