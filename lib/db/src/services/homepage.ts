import { supabase } from "../supabase";
import type { HomepageSettings, Banner } from "./types";

function mapSettings(row: Record<string, unknown>): HomepageSettings {
  return {
    id: row.id as number,
    banners: (row.banners as Banner[]) ?? [],
    announcementText: row.announcement_text as string,
    announcementEnabled: row.announcement_enabled as boolean,
    updatedAt: row.updated_at as string,
  };
}

const DEFAULTS: Omit<HomepageSettings, "id" | "updatedAt"> = {
  banners: [],
  announcementText: "Free Shipping On Any 2 Purchases!",
  announcementEnabled: true,
};

export const homepageService = {
  async get(): Promise<HomepageSettings> {
    const { data } = await supabase
      .from("homepage_settings")
      .select("*")
      .limit(1)
      .single();

    if (!data) {
      return { id: 0, ...DEFAULTS, updatedAt: new Date().toISOString() };
    }
    return mapSettings(data as Record<string, unknown>);
  },

  async upsert(patch: {
    banners?: Banner[];
    announcementText?: string;
    announcementEnabled?: boolean;
  }): Promise<HomepageSettings> {
    const { data: existing } = await supabase
      .from("homepage_settings")
      .select("id")
      .limit(1)
      .single();

    const payload: Record<string, unknown> = {};
    if (patch.banners !== undefined) payload.banners = patch.banners;
    if (patch.announcementText !== undefined) payload.announcement_text = patch.announcementText;
    if (patch.announcementEnabled !== undefined) payload.announcement_enabled = patch.announcementEnabled;

    if (existing) {
      const { data, error } = await supabase
        .from("homepage_settings")
        .update(payload)
        .eq("id", (existing as any).id)
        .select()
        .single();
      if (error) throw error;
      return mapSettings(data as Record<string, unknown>);
    } else {
      const { data, error } = await supabase
        .from("homepage_settings")
        .insert({ ...DEFAULTS, ...payload })
        .select()
        .single();
      if (error) throw error;
      return mapSettings(data as Record<string, unknown>);
    }
  },
};
