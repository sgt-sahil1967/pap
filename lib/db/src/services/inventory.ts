import { supabase } from "../supabase";
import type { InventoryItem, InventoryLog } from "./types";

function mapInventoryItem(row: Record<string, unknown>): InventoryItem {
  return {
    id: row.id as number,
    productId: row.product_id as number,
    productTitle: row.products ? (row.products as any).title as string : "",
    size: row.size as string,
    sku: (row.sku as string) ?? "",
    inventoryQty: row.inventory_qty as number,
    inventoryReserved: row.inventory_reserved as number,
  };
}

function mapLog(row: Record<string, unknown>): InventoryLog {
  return {
    id: row.id as number,
    productId: row.product_id as number,
    variantId: row.variant_id as number,
    delta: row.delta as number,
    reason: row.reason as string,
    orderId: (row.order_id as number) ?? null,
    createdAt: row.created_at as string,
  };
}

export const inventoryService = {
  async list(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from("product_variants")
      .select("*, products(title)")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((r) => mapInventoryItem(r as Record<string, unknown>));
  },

  async listLogs(productId?: number): Promise<InventoryLog[]> {
    let query = supabase
      .from("inventory_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (productId !== undefined) query = query.eq("product_id", productId);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((r) => mapLog(r as Record<string, unknown>));
  },

  async adjust(variantId: number, delta: number, reason: string): Promise<void> {
    const { data: variant, error: fetchErr } = await supabase
      .from("product_variants")
      .select("product_id, inventory_qty")
      .eq("id", variantId)
      .single();

    if (fetchErr || !variant) throw fetchErr ?? new Error("Variant not found");

    const newQty = (variant as any).inventory_qty + delta;

    const { error: updErr } = await supabase
      .from("product_variants")
      .update({ inventory_qty: newQty })
      .eq("id", variantId);
    if (updErr) throw updErr;

    const { error: logErr } = await supabase.from("inventory_logs").insert({
      product_id: (variant as any).product_id,
      variant_id: variantId,
      delta,
      reason: reason || "manual_adjustment",
    });
    if (logErr) throw logErr;
  },
};
