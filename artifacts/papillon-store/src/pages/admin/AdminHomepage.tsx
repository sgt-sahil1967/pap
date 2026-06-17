import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { Check, Image, Megaphone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORY_LINKS = [
  { label: "All Collections", value: "/collections" },
  { label: "Cotton Frock", value: "/collections/cotton-frock" },
  { label: "Kurta Set", value: "/collections/kurta-set" },
  { label: "Co-ord Set", value: "/collections/co-ord-set" },
  { label: "Silk Frock", value: "/collections/silk-frock" },
  { label: "Parkar Polka", value: "/collections/parkar-polka" },
  { label: "Paithani Frock", value: "/collections/paithani-frock" },
];

function SaveBadge({ saved }: { saved: boolean }) {
  if (!saved) return null;
  return (
    <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
      <Check className="w-4 h-4" /> Saved
    </span>
  );
}

export default function AdminHomepage() {
  const { config, updateHeroBanner, updateAnnouncementBar } = useSiteConfig();

  const [banner, setBanner] = useState({ ...config.heroBanner });
  const [bar, setBar] = useState({ ...config.announcementBar });
  const [bannerSaved, setBannerSaved] = useState(false);
  const [barSaved, setBarSaved] = useState(false);

  const saveBanner = () => {
    updateHeroBanner(banner);
    setBannerSaved(true);
    setTimeout(() => setBannerSaved(false), 2500);
  };

  const saveBar = () => {
    updateAnnouncementBar(bar);
    setBarSaved(true);
    setTimeout(() => setBarSaved(false), 2500);
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Homepage Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Changes are saved to your store immediately.
          </p>
        </div>

        {/* ── Announcement Bar ── */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Announcement Bar</h2>
          </div>
          <div className="px-6 py-5 space-y-5">
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Show announcement bar</p>
                <p className="text-xs text-gray-400 mt-0.5">Displays the green banner at the top of every page</p>
              </div>
              <button
                onClick={() => setBar((b) => ({ ...b, enabled: !b.enabled }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                  bar.enabled ? "bg-green-500" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform ${
                    bar.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Announcement text
              </label>
              <input
                type="text"
                value={bar.text}
                onChange={(e) => setBar((b) => ({ ...b, text: e.target.value }))}
                disabled={!bar.enabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:bg-gray-50"
                placeholder="e.g. Free Shipping On Any 2 Purchases! 🎉"
              />
            </div>

            {/* Preview */}
            {bar.enabled && (
              <div className="rounded-lg overflow-hidden border border-gray-100">
                <p className="text-xs text-gray-400 px-3 pt-2 pb-1">Preview</p>
                <div className="bg-[#00af13] text-white text-center py-2 text-sm font-medium px-4">
                  {bar.text || "—"}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={saveBar}
                className="bg-purple-700 hover:bg-purple-800 text-white text-sm px-5 py-2 h-auto"
              >
                Save
              </Button>
              <SaveBadge saved={barSaved} />
            </div>
          </div>
        </section>

        {/* ── Hero Banner ── */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Image className="w-4 h-4 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Hero Banner</h2>
          </div>
          <div className="px-6 py-5 space-y-5">
            {/* Heading */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Heading
              </label>
              <input
                type="text"
                value={banner.heading}
                onChange={(e) => setBanner((b) => ({ ...b, heading: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Celebrate Childhood with Colors"
              />
            </div>

            {/* Subheading */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Subheading
              </label>
              <textarea
                value={banner.subheading}
                onChange={(e) => setBanner((b) => ({ ...b, subheading: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="A short description below the heading"
              />
            </div>

            {/* Button Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Button text
              </label>
              <input
                type="text"
                value={banner.buttonText}
                onChange={(e) => setBanner((b) => ({ ...b, buttonText: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Shop the Collection"
              />
            </div>

            {/* Banner Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Banner background image URL
              </label>
              <input
                type="url"
                value={banner.imageUrl}
                onChange={(e) => setBanner((b) => ({ ...b, imageUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/image.jpg (leave empty for default)"
              />
              {banner.imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden h-28 border border-gray-100">
                  <img
                    src={banner.imageUrl}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Banner Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Banner link <span className="text-gray-400 font-normal">(entire banner is clickable)</span>
              </label>
              <select
                value={banner.linkUrl}
                onChange={(e) => setBanner((b) => ({ ...b, linkUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                {CATEGORY_LINKS.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Clicking anywhere on the banner will navigate to this link
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={saveBanner}
                className="bg-purple-700 hover:bg-purple-800 text-white text-sm px-5 py-2 h-auto"
              >
                Save
              </Button>
              <SaveBadge saved={bannerSaved} />
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
