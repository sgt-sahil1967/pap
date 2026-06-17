import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Plus, Trash2 } from "lucide-react";

export default function HomepageSettings() {
  const [announcement, setAnnouncement] = useState({
    enabled: true,
    text: "Free shipping on orders over ₹2000!"
  });

  const [banners, setBanners] = useState([
    { id: "1", image: "https://via.placeholder.com/1200x400", link: "/collections/new", alt: "New Collection", enabled: true }
  ]);

  const handleSave = () => {
    alert("Homepage settings saved!");
  };

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Homepage Settings</h2>
        <Button className="gap-2" onClick={handleSave}>
          <Save size={16} /> Save Changes
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
              checked={announcement.enabled}
              onChange={e => setAnnouncement({...announcement, enabled: e.target.checked})}
            />
            <label htmlFor="ann-enabled" className="text-sm font-medium">Enable Announcement Bar</label>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Text</label>
            <Input 
              value={announcement.text}
              onChange={e => setAnnouncement({...announcement, text: e.target.value})}
              disabled={!announcement.enabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Hero Banners</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => {
              setBanners([...banners, { id: Date.now().toString(), image: "", link: "", alt: "", enabled: true }]);
            }}>
              <Plus size={14} className="mr-1" /> Add Banner
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {banners.map((banner, idx) => (
            <div key={banner.id} className="p-4 border rounded-lg relative bg-muted/10 space-y-4">
              <div className="absolute top-4 right-4 flex gap-2">
                <div className="flex items-center gap-2 mr-4">
                  <input 
                    type="checkbox" 
                    id={`banner-enable-${banner.id}`}
                    checked={banner.enabled}
                    onChange={e => {
                      const newBanners = [...banners];
                      newBanners[idx].enabled = e.target.checked;
                      setBanners(newBanners);
                    }}
                  />
                  <label htmlFor={`banner-enable-${banner.id}`} className="text-xs">Enabled</label>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => {
                  setBanners(banners.filter((_, i) => i !== idx));
                }}>
                  <Trash2 size={14} />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Image URL</label>
                  <Input value={banner.image} onChange={e => {
                    const nb = [...banners]; nb[idx].image = e.target.value; setBanners(nb);
                  }} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Link URL</label>
                  <Input value={banner.link} onChange={e => {
                    const nb = [...banners]; nb[idx].link = e.target.value; setBanners(nb);
                  }} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-medium">Alt Text</label>
                  <Input value={banner.alt} onChange={e => {
                    const nb = [...banners]; nb[idx].alt = e.target.value; setBanners(nb);
                  }} />
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              No banners added yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
