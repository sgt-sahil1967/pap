import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  title: string;
  handle: string;
  type: string;
  status: string;
  images: string[];
  created_at: string;
  variantCount: number;
  minPrice: number | null;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleting, setDeleting] = useState<number | null>(null);
  const searchRef = useRef<ReturnType<typeof setTimeout>>();

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from("products")
      .select("id, title, handle, type, status, images, created_at, product_variants(id, price)")
      .order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data } = await query;
    setProducts(
      (data ?? []).map((p: any) => ({
        ...p,
        variantCount: p.product_variants?.length ?? 0,
        minPrice: p.product_variants?.length
          ? Math.min(...p.product_variants.map((v: any) => Number(v.price)))
          : null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(load, 300);
  }, [search, statusFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product and all its variants? This cannot be undone.")) return;
    setDeleting(id);
    await supabase.from("product_variants").delete().eq("product_id", id);
    await supabase.from("products").delete().eq("id", id);
    setDeleting(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <Link href="/products/new">
          <Button className="gap-2">
            <Plus size={16} /> Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex gap-4 items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.title} className="w-10 h-10 rounded object-cover bg-muted" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>{product.title}</div>
                      <div className="text-xs text-muted-foreground">{product.handle}</div>
                    </TableCell>
                    <TableCell>{product.type}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === "active" ? "success" : "secondary"}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.variantCount}</TableCell>
                    <TableCell>
                      {product.minPrice != null ? `₹${product.minPrice}` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/products/${product.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit size={16} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          disabled={deleting === product.id}
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
