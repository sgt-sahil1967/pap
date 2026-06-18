import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export interface HeroBanner {
  heading: string;
  subheading: string;
  buttonText: string;
  imageUrl: string;
  linkUrl: string;
}

export interface AnnouncementBar {
  enabled: boolean;
  text: string;
}

export interface SiteConfig {
  heroBanner: HeroBanner;
  announcementBar: AnnouncementBar;
}

const DEFAULT_CONFIG: SiteConfig = {
  heroBanner: {
    heading: "Celebrate Childhood with Colors",
    subheading:
      "Handcrafted Indian ethnic wear for your little ones. Joyful designs, comfortable fabrics, and festive spirit in every stitch.",
    buttonText: "Shop the Collection",
    imageUrl: "",
    linkUrl: "/collections",
  },
  announcementBar: {
    enabled: true,
    text: "Free Shipping On Any 2 Purchases! 🎉",
  },
};

interface SiteConfigContextValue {
  config: SiteConfig;
  loading: boolean;
  updateConfig: (patch: Partial<SiteConfig>) => void;
  updateHeroBanner: (patch: Partial<HeroBanner>) => Promise<void>;
  updateAnnouncementBar: (patch: Partial<AnnouncementBar>) => Promise<void>;
  resetConfig: () => void;
}

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [rowId, setRowId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from("homepage_settings")
          .select("*")
          .order("id", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (data) {
          setRowId(data.id);
          const heroFromDb = Array.isArray(data.banners) && data.banners.length > 0
            ? data.banners[0]
            : null;
          setConfig({
            heroBanner: {
              heading: heroFromDb?.heading ?? DEFAULT_CONFIG.heroBanner.heading,
              subheading: heroFromDb?.subheading ?? DEFAULT_CONFIG.heroBanner.subheading,
              buttonText: heroFromDb?.buttonText ?? DEFAULT_CONFIG.heroBanner.buttonText,
              imageUrl: heroFromDb?.imageUrl ?? DEFAULT_CONFIG.heroBanner.imageUrl,
              linkUrl: heroFromDb?.linkUrl ?? DEFAULT_CONFIG.heroBanner.linkUrl,
            },
            announcementBar: {
              enabled: data.announcement_enabled ?? DEFAULT_CONFIG.announcementBar.enabled,
              text: data.announcement_text ?? DEFAULT_CONFIG.announcementBar.text,
            },
          });
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const persist = useCallback(async (next: SiteConfig, id: number | null) => {
    const payload = {
      banners: [next.heroBanner],
      announcement_text: next.announcementBar.text,
      announcement_enabled: next.announcementBar.enabled,
    };
    if (id) {
      await supabase.from("homepage_settings").update(payload).eq("id", id);
    } else {
      const { data } = await supabase
        .from("homepage_settings")
        .insert(payload)
        .select("id")
        .single();
      if (data) setRowId(data.id);
    }
  }, []);

  const updateConfig = (patch: Partial<SiteConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  const updateHeroBanner = async (patch: Partial<HeroBanner>) => {
    setConfig((prev) => {
      const next = { ...prev, heroBanner: { ...prev.heroBanner, ...patch } };
      persist(next, rowId);
      return next;
    });
  };

  const updateAnnouncementBar = async (patch: Partial<AnnouncementBar>) => {
    setConfig((prev) => {
      const next = { ...prev, announcementBar: { ...prev.announcementBar, ...patch } };
      persist(next, rowId);
      return next;
    });
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    if (rowId) {
      supabase.from("homepage_settings").update({
        banners: [DEFAULT_CONFIG.heroBanner],
        announcement_text: DEFAULT_CONFIG.announcementBar.text,
        announcement_enabled: DEFAULT_CONFIG.announcementBar.enabled,
      }).eq("id", rowId);
    }
  };

  return (
    <SiteConfigContext.Provider
      value={{ config, loading, updateConfig, updateHeroBanner, updateAnnouncementBar, resetConfig }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error("useSiteConfig must be used within SiteConfigProvider");
  return ctx;
}
