import { sendRequest } from "../lib/api";
import { submitFormData } from "./formService";

export type MusicData = {
  id: number;
  screen_id: number;
  title?: string;
  description?: string;
  songs?: any[];
  [key: string]: any;
};

/**
 * Fetch music screen data
 * @param screen_id - The screen ID to fetch data for
 * @returns Promise with music data or null
 */
export async function fetchMusicData(
  screen_id: string | number
): Promise<MusicData | null> {
  try {
    const response = await sendRequest({
      url: `admin/forms/${screen_id}`,
      method: "get",
    });

    console.log(`Fetched music data for screen ${screen_id}:`, response);

    if (response && response.data) {
      return response.data as MusicData;
    }
    return null;
  } catch (err) {
    console.warn(`fetchMusicData error for screen ${screen_id}:`, err);
    return null;
  }
}

/**
 * Submit music form data
 * @param screen_id - The screen ID
 * @param data - The data to submit
 * @returns Promise with response
 */
export async function submitMusicData(
  screen_id: string | number,
  values: any,
  originalFields?: any[]
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // reuse submitFormData to build proper payload (handles files and fields[] entries)
    const res = await submitFormData(screen_id, values, originalFields);
    return res;
  } catch (err) {
    console.warn(`submitMusicData error for screen ${screen_id}:`, err);
    return {
      success: false,
      message: "Failed to submit music data",
    };
  }
}
