import { useState, useEffect, useRef } from "react";
import AdminLayout from "./AdminLayout";
import {
  Plus, Pencil, Trash2, Search, ChevronDown, ChevronUp, X, Check,
  Package, Tag, DollarSign, Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API = "/api";

function getToken() { return sessionStorage.getItem("papillon_admin_token") ?? ""; }

function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y"];
const TYPES = ["Cotton Frock", "Kurta Set", "Co-ord set", "Silk Frock", "Parkar Polka", "Paithani Frock"];
const COLORS = ["Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Orange", "White", "Black", "Multicolor"];

type Variant = {
  id?: number;
  size: string;
  color: string;
  price: number | string;
  comparePrice: number | string;
  sku: string;
  inventoryQty: number;
};

type Product = {
  id: number;
  handle: string;
  title: string;
  body: string;
  type: string;
  category: string;
  tags: string;
  images: string[];
  status: string;
  variantCount?: number;
  minPrice?: number;
  variants?: Variant[];
};

const EMPTY_VARIANT: Variant = { size: "S", color: "", price: "", comparePrice: "", sku: "", inventoryQty: 0 };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Product;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    handle: initial?.handle ?? "",
    body: initial?.body ?? "",
    type: initial?.type ?? TYPES[0],
    category: initial?.category ?? "",
    tags: initial?.tags ?? "",
    status: initial?.status ?? "active",
    images: (initial?.images ?? []).join("\n"),
  });
  const [variants, setVariants] = useState<Variant[]>(
    initial?.variants?.length ? initial.variants : [{ ...EMPTY_VARIANT }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, handle: f.handle || slugify(title) }));
  };

  const addVariant = () => setVariants((v) => [...v, { ...EMPTY_VARIANT }]);
  const removeVariant = (i: number) => setVariants((v) => v.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, patch: Partial<Variant>) =>
    setVariants((v) => v.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        ...form,
        images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
        variants: variants.map((v) => ({
          ...v,
          price: Number(v.price),
          comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
        })),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Basic Info */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Package className="w-4 h-4 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Basic Information</h3>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
              <input required value={form.title} onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Cotton Frock – Floral" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Handle (URL slug) <span className="text-red-500">*</span></label>
              <input required value={form.handle} onChange={(e) => setForm((f) => ({ ...f, handle: slugify(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="cotton-frock-floral" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Product description…" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
              <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="festive, new-arrival" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Images</h3>
        </div>
        <div className="px-6 py-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Image URLs <span className="text-gray-400 font-normal">(one per line)</span>
          </label>
          <textarea value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
            rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono"
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" />
          {form.images.split("\n").filter((u) => u.trim()).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {form.images.split("\n").filter((u) => u.trim()).map((url, i) => (
                <img key={i} src={url.trim()} alt="" className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Variants */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Variants <span className="text-gray-400 font-normal text-sm">(size, color, price, SKU)</span></h3>
          </div>
          <button type="button" onClick={addVariant}
            className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium">
            <Plus className="w-4 h-4" /> Add variant
          </button>
        </div>
        <div className="px-6 py-4 space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-6 gap-2 items-center">
              <select value={v.size} onChange={(e) => updateVariant(i, { size: e.target.value })}
                className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                {SIZES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={v.color} onChange={(e) => updateVariant(i, { color: e.target.value })}
                className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                <option value="">No color</option>
                {COLORS.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="number" step="0.01" min="0" placeholder="Price ₹" value={v.price}
                onChange={(e) => updateVariant(i, { price: e.target.value })} required
                className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <input type="number" step="0.01" min="0" placeholder="Compare ₹" value={v.comparePrice}
                onChange={(e) => updateVariant(i, { comparePrice: e.target.value })}
                className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <input placeholder="SKU" value={v.sku}
                onChange={(e) => updateVariant(i, { sku: e.target.value })}
                className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <div className="flex items-center gap-1">
                <input type="number" min="0" placeholder="Qty" value={v.inventoryQty}
                  onChange={(e) => updateVariant(i, { inventoryQty: Number(e.target.value) })}
                  className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} className="text-gray-400 hover:text-red-500 p-1">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400 pt-1">Columns: Size · Color · Price · Compare-at price · SKU · Inventory qty</p>
        </div>
      </section>

      <div className="flex items-center gap-3 pb-8">
        <Button type="submit" disabled={saving}
          className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2.5 h-auto">
          {saving ? "Saving…" : initial ? "Update Product" : "Create Product"}
        </Button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          Cancel
        </button>
      </div>
    </form>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
    }`}>
      {status === "active" ? "Active" : "Draft"}
    </span>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const searchRef = useRef<ReturnType<typeof setTimeout>>();

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`${API}/products?${params}`);
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(load, 300);
  }, [search, statusFilter]);

  const handleCreate = async (data: Record<string, unknown>) => {
    const res = await fetch(`${API}/products`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? "Create failed");
    setView("list");
    load();
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!editing) return;
    const res = await fetch(`${API}/products/${editing.id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? "Update failed");

    // sync variants separately
    const varRes = await fetch(`${API}/products/${editing.id}/variants`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data.variants),
    });
    if (!varRes.ok) throw new Error("Variant update failed");

    setView("list");
    setEditing(null);
    load();
  };

  const openEdit = async (p: Product) => {
    const res = await fetch(`${API}/products/${p.id}`);
    const full = await res.json();
    setEditing(full);
    setView("edit");
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
    setDeleting(true);
    await fetch(`${API}/products/${deleteId}?hard=true`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    setDeleteId(null);
    setDeleting(false);
    load();
  };

  if (view === "create") {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
          </div>
          <ProductForm onSave={handleCreate} onCancel={() => setView("list")} />
        </div>
      </AdminLayout>
    );
  }

  if (view === "edit" && editing) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-500 text-sm mt-1">{editing.title}</p>
          </div>
          <ProductForm initial={editing} onSave={handleEdit} onCancel={() => { setView("list"); setEditing(null); }} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-500 text-sm mt-1">{products.length} total</p>
          </div>
          <Button onClick={() => setView("create")}
            className="bg-purple-700 hover:bg-purple-800 text-white flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">Loading…</div>
          ) : products.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No products yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "Add Product" to create your first one.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Variants</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">From</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{p.title}</p>
                          <p className="text-gray-400 text-xs">{p.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.type}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-gray-600">{p.variantCount ?? 0}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.minPrice != null ? `₹${Number(p.minPrice).toFixed(0)}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(p)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(p.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteId != null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete product?</h3>
            <p className="text-gray-500 text-sm mb-6">This will permanently remove the product and all its variants. This cannot be undone.</p>
            <div className="flex gap-3">
              <Button onClick={confirmDelete} disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                {deleting ? "Deleting…" : "Delete"}
              </Button>
              <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
