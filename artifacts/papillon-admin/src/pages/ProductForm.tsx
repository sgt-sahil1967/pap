import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y"];
const TYPES = ["Kurta", "Saree", "Frock", "Lehenga", "Dhoti", "Dupatta", "Cotton Frock", "Kurta Set", "Co-ord set", "Silk Frock", "Parkar Polka", "Paithani Frock"];

type Variant = {
  id?: number;
  size: string;
  price: string;
  comparePrice: string;
  sku: string;
  qty: string;
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function ProductForm() {
  const [matchNew] = useRoute("/products/new");
  const [matchEdit, params] = useRoute("/products/:id/edit");
  const isEdit = matchEdit && !!params?.id && params.id !== "new";
  const [, setLocation] = useLocation();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    handle: "",
    body: "",
    type: TYPES[0],
    category: "",
    tags: "",
    status: "active",
  });

  const [images, setImages] = useState([{ url: "" }]);
  const [variants, setVariants] = useState<Variant[]>([
    { size: "S", price: "", comparePrice: "", sku: "", qty: "0" },
  ]);

  useEffect(() => {
    if (!isEdit || !params?.id) return;
    supabase
      .from("products")
      .select("*, product_variants(*)")
      .eq("id", params.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFormData({
            title: data.title ?? "",
            handle: data.handle ?? "",
            body: data.body ?? "",
            type: data.type ?? TYPES[0],
            category: data.category ?? "",
            tags: data.tags ?? "",
            status: data.status ?? "active",
          });
          setImages(
            data.images?.length
              ? data.images.map((u: string) => ({ url: u }))
              : [{ url: "" }]
          );
          setVariants(
            data.product_variants?.length
              ? data.product_variants.map((v: any) => ({
                  id: v.id,
                  size: v.size ?? "",
                  price: String(v.price ?? ""),
                  comparePrice: String(v.compare_price ?? ""),
                  sku: v.sku ?? "",
                  qty: String(v.inventory_qty ?? "0"),
                }))
              : [{ size: "S", price: "", comparePrice: "", sku: "", qty: "0" }]
          );
        }
        setLoading(false);
      });
  }, [isEdit, params?.id]);

  const handleTitleChange = (title: string) => {
    setFormData((f) => ({ ...f, title, handle: f.handle || slugify(title) }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const imageUrls = images.map((i) => i.url.trim()).filter(Boolean);
      const productPayload = {
        title: formData.title,
        handle: formData.handle || slugify(formData.title),
        body: formData.body,
        type: formData.type,
        category: formData.category,
        tags: formData.tags,
        status: formData.status,
        images: imageUrls,
      };

      let productId: number;
      if (isEdit && params?.id) {
        const { error: err } = await supabase
          .from("products")
          .update(productPayload)
          .eq("id", params.id);
        if (err) throw new Error(err.message);
        productId = Number(params.id);
        await supabase.from("product_variants").delete().eq("product_id", productId);
      } else {
        const { data, error: err } = await supabase
          .from("products")
          .insert(productPayload)
          .select()
          .single();
        if (err) throw new Error(err.message);
        productId = data.id;
      }

      const validVariants = variants.filter((v) => v.price !== "");
      if (validVariants.length) {
        const { error: varErr } = await supabase.from("product_variants").insert(
          validVariants.map((v) => ({
            product_id: productId,
            size: v.size,
            price: Number(v.price),
            compare_price: v.comparePrice ? Number(v.comparePrice) : null,
            sku: v.sku || null,
            inventory_qty: Number(v.qty) || 0,
          }))
        );
        if (varErr) throw new Error(varErr.message);
      }

      setLocation("/products");
    } catch (err: any) {
      setError(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">Loading…</div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => setLocation("/products")}>
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">{isEdit ? "Edit Product" : "Add Product"}</h2>
        <div className="flex-1" />
        <Button type="button" variant="outline" onClick={() => setLocation("/products")}>Cancel</Button>
        <Button type="submit" className="gap-2" disabled={saving}>
          <Save size={16} /> {saving ? "Saving…" : "Save"}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">{error}</div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Basic Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Handle (URL slug) <span className="text-destructive">*</span></label>
                <Input
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: slugify(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  rows={5}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

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
                    onChange={(e) => {
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

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Variants</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  setVariants([...variants, { size: "", price: "", comparePrice: "", sku: "", qty: "0" }]);
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
                    <TableHead>Price ₹</TableHead>
                    <TableHead>Compare at ₹</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((v, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <select
                          className="h-8 w-24 rounded-md border border-input bg-background px-2 text-sm"
                          value={v.size}
                          onChange={(e) => {
                            const nv = [...variants]; nv[idx].size = e.target.value; setVariants(nv);
                          }}
                        >
                          {SIZES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </TableCell>
                      <TableCell>
                        <Input type="number" className="w-24 h-8" value={v.price} onChange={(e) => {
                          const nv = [...variants]; nv[idx].price = e.target.value; setVariants(nv);
                        }} required />
                      </TableCell>
                      <TableCell>
                        <Input type="number" className="w-24 h-8" value={v.comparePrice} onChange={(e) => {
                          const nv = [...variants]; nv[idx].comparePrice = e.target.value; setVariants(nv);
                        }} />
                      </TableCell>
                      <TableCell>
                        <Input className="w-32 h-8" value={v.sku} onChange={(e) => {
                          const nv = [...variants]; nv[idx].sku = e.target.value; setVariants(nv);
                        }} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" className="w-20 h-8" value={v.qty} onChange={(e) => {
                          const nv = [...variants]; nv[idx].qty = e.target.value; setVariants(nv);
                        }} />
                      </TableCell>
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

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <Input
                  placeholder="Comma separated"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
