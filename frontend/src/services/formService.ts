import { sendRequest } from "../lib/api";

export type FormData = {
  id: number;
  screen_id: number;
  title?: string;
  description?: string;
  fields?: any[];
  [key: string]: any;
};

/**
 * Fetch form data for a specific screen
 * @param screen_id - The screen ID to fetch data for
 * @returns Promise with form data or null
 */
export async function fetchFormData(
  screen_id: string | number
): Promise<FormData | null> {
  try {
    console.log(`📥 Fetching form data for screen ID: ${screen_id}`);

    const response = await sendRequest({
      url: `admin/forms/${screen_id}`,
      method: "get",
    });

    console.log(`✅ Form data fetched successfully for screen ${screen_id}`, {
      success: response.success,
      fields_count: response.data?.fields?.length || 0,
      data: response.data,
    });

    // Handle different response structures
    if (response && response.success && response.data) {
      return response.data;
    }

    if (response && response.data) {
      return response.data;
    }

    if (
      response &&
      response.data &&
      typeof response.data.id === "number" &&
      typeof response.data.screen_id === "number"
    ) {
      return response.data as FormData;
    }
    return null;
  } catch (err) {
    console.error(`❌ Failed to fetch form data for screen ${screen_id}:`, err);
    return null;
  }
}

/**
 * Submit form values for a screen.
 * Builds FormData for file uploads when values contain `uri` objects.
 */
export async function submitFormData(
  screen_id: string | number,
  values: { [key: string]: any },
  originalFields?: any[]
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const hasFile = Object.values(values).some((v) => v && v.uri);

    console.log(`📤 Preparing form submission for screen ${screen_id}`, {
      hasFiles: hasFile,
      fieldsCount: originalFields?.length || 0,
      values,
    });

    // helper to slugify label similar to Laravel's Str::slug with '_'
    const slugify = (text: string) => {
      return String(text)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
    };

    // Build payload either as JSON (no files) or multipart FormData (with files or when originalFields provided)
    if (hasFile || originalFields) {
      const formData = new FormData();

      // Build fields array and map renderer keys (e.g. 'field_1') to backend field keys (slugified label)
      const fieldsArr = (originalFields || []).map((f: any, idx: number) => {
        const renderKey = f.key || `field_${idx}`; // key used by renderer when no explicit key provided
        const fieldKey = f.key || slugify(f.label || `field_${idx}`); // expected backend key
        const value =
          values[renderKey] !== undefined ? values[renderKey] : f.value ?? "";
        return { ...f, value, renderKey, fieldKey };
      });

      // Append fields[...] entries
      fieldsArr.forEach((f: any, i: number) => {
        Object.keys(f).forEach((prop) => {
          if (prop === "renderKey" || prop === "fieldKey") return;
          const val = f[prop];
          if (val && typeof val === "object" && val.uri) return; // skip file objects
          formData.append(
            `fields[${i}][${prop}]`,
            val === undefined || val === null ? "" : String(val)
          );
        });
      });

      // Attach files under their mapped backend keys using renderKey -> fieldKey mapping
      fieldsArr.forEach((f: any) => {
        const v = values[f.renderKey];
        if (v && v.uri) {
          // @ts-ignore
          formData.append(f.fieldKey, {
            uri: v.uri,
            name: v.name || `${f.fieldKey}`,
            type: v.mimeType || "application/octet-stream",
          });
        }
      });

      console.log(`📦 Sending multipart form data for screen ${screen_id}`);

      const response = await sendRequest({
        url: `admin/forms/${screen_id}/store`,
        method: "post",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(`✅ Form submitted successfully (multipart)`, {
        success: response.success,
        message: response.message,
        response,
      });

      return {
        success: !!response.success,
        message: response.message || "",
        data: response.data,
      };
    }

    // No files and no originalFields - send simple payload (fields as array/object expected by backend)
    console.log(`📦 Sending JSON form data for screen ${screen_id}`, {
      fields: values,
    });

    const response = await sendRequest({
      url: `admin/forms/${screen_id}/store`,
      method: "post",
      data: { fields: values },
    });

    console.log(`✅ Form submitted successfully (JSON)`, {
      success: response.success,
      message: response.message,
      response,
    });

    return {
      success: !!response.success,
      message: response.message || "",
      data: response.data,
    };
  } catch (err) {
    console.error(`❌ Form submission error for screen ${screen_id}:`, err);
    return { success: false, message: "Failed to submit form" };
  }
}
