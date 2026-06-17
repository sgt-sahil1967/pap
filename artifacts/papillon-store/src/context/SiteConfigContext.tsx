import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

const STORAGE_KEY = "papillon_site_config";

interface SiteConfigContextValue {
  config: SiteConfig;
  updateConfig: (patch: Partial<SiteConfig>) => void;
  updateHeroBanner: (patch: Partial<HeroBanner>) => void;
  updateAnnouncementBar: (patch: Partial<AnnouncementBar>) => void;
  resetConfig: () => void;
}

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<SiteConfig>;
        return {
          heroBanner: { ...DEFAULT_CONFIG.heroBanner, ...parsed.heroBanner },
          announcementBar: { ...DEFAULT_CONFIG.announcementBar, ...parsed.announcementBar },
        };
      }
    } catch {}
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const updateConfig = (patch: Partial<SiteConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  const updateHeroBanner = (patch: Partial<HeroBanner>) => {
    setConfig((prev) => ({
      ...prev,
      heroBanner: { ...prev.heroBanner, ...patch },
    }));
  };

  const updateAnnouncementBar = (patch: Partial<AnnouncementBar>) => {
    setConfig((prev) => ({
      ...prev,
      announcementBar: { ...prev.announcementBar, ...patch },
    }));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <SiteConfigContext.Provider
      value={{ config, updateConfig, updateHeroBanner, updateAnnouncementBar, resetConfig }}
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
