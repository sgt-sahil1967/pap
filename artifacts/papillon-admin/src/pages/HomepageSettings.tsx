import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Plus, Trash2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Banner = {
  image: string;
  link: string;
  alt: string;
  enabled: boolean;
};

type Settings = {
  id: number | null;
  announcement_enabled: boolean;
  announcement_text: string;
  banners: Banner[];
};

const DEFAULT_SETTINGS: Settings = {
  id: null,
  announcement_enabled: true,
  announcement_text: "Free shipping on orders over ₹2000!",
  banners: [],
};

export default function HomepageSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from("homepage_settings")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSettings({
            id: data.id,
            announcement_enabled: data.announcement_enabled ?? true,
            announcement_text: data.announcement_text ?? DEFAULT_SETTINGS.announcement_text,
            banners: Array.isArray(data.banners) ? data.banners : [],
          });
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      announcement_enabled: settings.announcement_enabled,
      announcement_text: settings.announcement_text,
      banners: settings.banners,
    };
    if (settings.id) {
      await supabase.from("homepage_settings").update(payload).eq("id", settings.id);
    } else {
      const { data } = await supabase.from("homepage_settings").insert(payload).select("id").single();
      if (data) setSettings((s) => ({ ...s, id: data.id }));
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const updateBanner = (idx: number, patch: Partial<Banner>) => {
    setSettings((s) => ({
      ...s,
      banners: s.banners.map((b, i) => (i === idx ? { ...b, ...patch } : b)),
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Homepage Settings</h2>
        <Button className="gap-2" onClick={handleSave} disabled={saving}>
          {saved ? (
            <><Check size={16} /> Saved</>
          ) : (
            <><Save size={16} /> {saving ? "Saving…" : "Save Changes"}</>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Announcement Bar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ann-enabled"
              className="w-4 h-4 text-primary"
              checked={settings.announcement_enabled}
              onChange={(e) => setSettings((s) => ({ ...s, announcement_enabled: e.target.checked }))}
            />
            <label htmlFor="ann-enabled" className="text-sm font-medium">Enable Announcement Bar</label>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Text</label>
            <Input
              value={settings.announcement_text}
              onChange={(e) => setSettings((s) => ({ ...s, announcement_text: e.target.value }))}
              disabled={!settings.announcement_enabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Hero Banners</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSettings((s) => ({
                ...s,
                banners: [...s.banners, { image: "", link: "", alt: "", enabled: true }],
              }))}
            >
              <Plus size={14} className="mr-1" /> Add Banner
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.banners.map((banner, idx) => (
            <div key={idx} className="p-4 border rounded-lg relative bg-muted/10 space-y-4">
              <div className="absolute top-4 right-4 flex gap-2">
                <div className="flex items-center gap-2 mr-4">
                  <input
                    type="checkbox"
                    id={`banner-enable-${idx}`}
                    checked={banner.enabled}
                    onChange={(e) => updateBanner(idx, { enabled: e.target.checked })}
                  />
                  <label htmlFor={`banner-enable-${idx}`} className="text-xs">Enabled</label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => setSettings((s) => ({
                    ...s,
                    banners: s.banners.filter((_, i) => i !== idx),
                  }))}
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Image URL</label>
                  <Input
                    value={banner.image}
                    onChange={(e) => updateBanner(idx, { image: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Link URL</label>
                  <Input
                    value={banner.link}
                    onChange={(e) => updateBanner(idx, { link: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-medium">Alt Text</label>
                  <Input
                    value={banner.alt}
                    onChange={(e) => updateBanner(idx, { alt: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
          {settings.banners.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              No banners added yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
