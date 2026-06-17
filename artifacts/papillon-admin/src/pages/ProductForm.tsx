import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

export default function ProductForm() {
  const [, params] = useRoute("/products/:id/edit");
  const isEdit = !!params?.id;
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    title: "",
    handle: "",
    body: "",
    type: "Kurta",
    category: "",
    tags: "",
    status: "active"
  });

  const [images, setImages] = useState([{ url: "" }]);
  const [variants, setVariants] = useState([{ size: "M", price: "0", comparePrice: "0", sku: "", qty: "0" }]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    alert("Saved successfully!");
    setLocation("/products");
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => setLocation("/products")}>
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">{isEdit ? "Edit Product" : "Add Product"}</h2>
        <div className="flex-1" />
        <Button type="button" variant="outline" onClick={() => setLocation("/products")}>Cancel</Button>
        <Button type="submit" className="gap-2"><Save size={16} /> Save</Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Main Info */}
          <Card>
            <CardHeader><CardTitle>Basic Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Handle</label>
                <Input value={formData.handle} onChange={e => setFormData({...formData, handle: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea rows={6} value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} />
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Images</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  if (images.length < 10) setImages([...images, { url: "" }]);
                }}>
                  <Plus size={14} className="mr-1" /> Add Image URL
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {images.map((img, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input 
                    placeholder="https://..." 
                    value={img.url}
                    onChange={e => {
                      const newImages = [...images];
                      newImages[idx].url = e.target.value;
                      setImages(newImages);
                    }}
                  />
                  <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => {
                    setImages(images.filter((_, i) => i !== idx));
                  }}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Variants</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  setVariants([...variants, { size: "", price: "0", comparePrice: "0", sku: "", qty: "0" }]);
                }}>
                  <Plus size={14} className="mr-1" /> Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Compare at</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((v, idx) => (
                    <TableRow key={idx}>
                      <TableCell><Input className="w-20" value={v.size} onChange={e => {
                        const nv = [...variants]; nv[idx].size = e.target.value; setVariants(nv);
                      }} /></TableCell>
                      <TableCell><Input type="number" className="w-24" value={v.price} onChange={e => {
                        const nv = [...variants]; nv[idx].price = e.target.value; setVariants(nv);
                      }} /></TableCell>
                      <TableCell><Input type="number" className="w-24" value={v.comparePrice} onChange={e => {
                        const nv = [...variants]; nv[idx].comparePrice = e.target.value; setVariants(nv);
                      }} /></TableCell>
                      <TableCell><Input className="w-32" value={v.sku} onChange={e => {
                        const nv = [...variants]; nv[idx].sku = e.target.value; setVariants(nv);
                      }} /></TableCell>
                      <TableCell><Input type="number" className="w-20" value={v.qty} onChange={e => {
                        const nv = [...variants]; nv[idx].qty = e.target.value; setVariants(nv);
                      }} /></TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => {
                          setVariants(variants.filter((_, i) => i !== idx));
                        }}>
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Input value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <Input placeholder="Comma separated" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
