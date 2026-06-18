import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";

type InventoryRow = {
  id: number;
  product_id: number;
  size: string;
  sku: string | null;
  inventory_qty: number;
  inventory_reserved: number;
  productTitle: string;
  editing: boolean;
  editQty: string;
};

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("product_variants")
      .select("id, product_id, size, sku, inventory_qty, inventory_reserved, products(title)")
      .order("inventory_qty", { ascending: true });

    setInventory(
      (data ?? []).map((row: any) => ({
        id: row.id,
        product_id: row.product_id,
        size: row.size,
        sku: row.sku,
        inventory_qty: row.inventory_qty,
        inventory_reserved: row.inventory_reserved ?? 0,
        productTitle: row.products?.title ?? "Unknown",
        editing: false,
        editQty: String(row.inventory_qty),
      }))
    );
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveQty = async (row: InventoryRow) => {
    const qty = parseInt(row.editQty) || 0;
    setSaving(row.id);
    await supabase
      .from("product_variants")
      .update({ inventory_qty: qty })
      .eq("id", row.id);
    setInventory((prev) =>
      prev.map((r) => r.id === row.id ? { ...r, inventory_qty: qty, editing: false, editQty: String(qty) } : r)
    );
    setSaving(null);
  };

  const getRowColor = (available: number) => {
    if (available < 2) return "bg-destructive/10";
    if (available < 5) return "bg-warning/10";
    return "";
  };

  const filtered = inventory.filter((item) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      item.productTitle.toLowerCase().includes(s) ||
      (item.sku ?? "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by SKU or product..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="w-36">Stock Qty</TableHead>
                  <TableHead className="text-center">Reserved</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No inventory found
                    </TableCell>
                  </TableRow>
                ) : filtered.map((item) => {
                  const available = item.inventory_qty - item.inventory_reserved;
                  return (
                    <TableRow key={item.id} className={getRowColor(available)}>
                      <TableCell className="font-medium">{item.productTitle}</TableCell>
                      <TableCell>{item.size}</TableCell>
                      <TableCell className="font-mono text-xs">{item.sku ?? "—"}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="h-8 w-24"
                          value={item.editQty}
                          onChange={(e) => {
                            setInventory((prev) =>
                              prev.map((r) => r.id === item.id ? { ...r, editQty: e.target.value, editing: true } : r)
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-center">{item.inventory_reserved}</TableCell>
                      <TableCell className={`text-right font-bold ${available < 5 ? "text-destructive" : ""}`}>
                        {available}
                      </TableCell>
                      <TableCell>
                        {item.editing && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1"
                            disabled={saving === item.id}
                            onClick={() => saveQty(item)}
                          >
                            <Save size={12} /> {saving === item.id ? "…" : "Save"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
