import { sendRequest } from "../lib/api";

export type ScreenItem = {
  route: string;
  title: string;
  icon?: string;
  type?: string;
  id?: number;
  sort_order?: number;
};

export type FetchScreensOptions = {
  type?: string;
};

export async function fetchScreens(
  opts?: FetchScreensOptions
): Promise<ScreenItem[]> {
  try {
    const response = await sendRequest({ url: `admin/screens`, method: "get" });

    const payload =
      response && response.data !== undefined ? response.data : response;

    if (!Array.isArray(payload)) {
      console.warn("fetchScreens: unexpected payload", payload);
      return [];
    }

    const items = payload
      .filter(
        (it: any) => it && (it.is_active === undefined || it.is_active === true)
      )
      .filter((it: any) => (opts && opts.type ? it.type === opts.type : true))
      .map((it: any) => ({
        route: it.slug || it.route || String(it.id),
        title: it.name || it.title || it.slug || "",
        icon: it.icon || undefined,
        type: it.type,
        id: it.id,
        sort_order:
          typeof it.sort_order === "number" ? it.sort_order : undefined,
      }))
      .sort((a: ScreenItem, b: ScreenItem) => {
        const sa = a.sort_order ?? 0;
        const sb = b.sort_order ?? 0;
        return sa - sb;
      });

    return items as ScreenItem[];
  } catch (err) {
    console.warn("fetchScreens error:", err);
    return [];
  }
}
