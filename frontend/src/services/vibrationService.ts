import { sendRequest } from "../lib/api";

export type VibrationData = {
  id: number;
  screen_id: number;
  title?: string;
  description?: string;
  patterns?: any[];
  [key: string]: any;
};

/**
 * Fetch vibration screen data
 * @param screen_id - The screen ID to fetch data for
 * @returns Promise with vibration data or null
 */
export async function fetchVibrationData(
  screen_id: string | number
): Promise<VibrationData | null> {
  try {
    const response = await sendRequest({
      url: `admin/forms/${screen_id}`,
      method: "get",
    });

    console.log(`Fetched vibration data for screen ${screen_id}:`, response);

    if (response && response.data) {
      return response.data as VibrationData;
    }
    return null;
  } catch (err) {
    console.warn(`fetchVibrationData error for screen ${screen_id}:`, err);
    return null;
  }
}

/**
 * Submit vibration form data
 * @param screen_id - The screen ID
 * @param data - The data to submit
 * @returns Promise with response
 */
export async function submitVibrationData(
  screen_id: string | number,
  data: any
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await sendRequest({
      url: `admin/forms/${screen_id}/store`,
      method: "post",
      data,
    });
    console.log("response vibration service -> ", response);

    console.log(`Submitted vibration data for screen ${screen_id}:`, response);

    return {
      success: response.success,
      message: response.message,
      data: response.data,
    };
  } catch (err) {
    console.warn(`submitVibrationData error for screen ${screen_id}:`, err);
    return {
      success: false,
      message: "Failed to submit vibration data",
    };
  }
}
