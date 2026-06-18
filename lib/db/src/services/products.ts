import { supabase } from "../supabase";
import type { Product, ProductVariant, ProductWithVariants, ProductListItem } from "./types";

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as number,
    handle: row.handle as string,
    title: row.title as string,
    body: (row.body as string) ?? "",
    type: row.type as string,
    category: (row.category as string) ?? "",
    tags: (row.tags as string) ?? "",
    images: (row.images as string[]) ?? [],
    status: row.status as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapVariant(row: Record<string, unknown>): ProductVariant {
  return {
    id: row.id as number,
    productId: row.product_id as number,
    size: row.size as string,
    color: (row.color as string) ?? null,
    price: Number(row.price),
    comparePrice: row.compare_price != null ? Number(row.compare_price) : null,
    sku: (row.sku as string) ?? "",
    inventoryQty: row.inventory_qty as number,
    inventoryReserved: row.inventory_reserved as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const productsService = {
  async list(params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
  }): Promise<{ products: ProductListItem[]; page: number; limit: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("products")
      .select("*, product_variants(id, price)")
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (params.status) query = query.eq("status", params.status);
    if (params.type) query = query.eq("type", params.type);
    if (params.search) query = query.ilike("title", `%${params.search}%`);

    const { data, error } = await query;
    if (error) throw error;

    const products: ProductListItem[] = (data ?? []).map((row: any) => {
      const variants = (row.product_variants as Array<{ price: number }>) ?? [];
      return {
        id: row.id,
        handle: row.handle,
        title: row.title,
        type: row.type,
        category: row.category ?? "",
        images: row.images ?? [],
        status: row.status,
        createdAt: row.created_at,
        variantCount: variants.length,
        minPrice: variants.length > 0
          ? Math.min(...variants.map((v) => Number(v.price)))
          : null,
      };
    });

    return { products, page, limit };
  },

  async getByHandle(handle: string): Promise<ProductWithVariants | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(*)")
      .eq("handle", handle)
      .single();

    if (error || !data) return null;
    return {
      ...mapProduct(data as Record<string, unknown>),
      variants: ((data as any).product_variants ?? []).map((v: Record<string, unknown>) => mapVariant(v)),
    };
  },

  async getById(id: number): Promise<ProductWithVariants | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(*)")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return {
      ...mapProduct(data as Record<string, unknown>),
      variants: ((data as any).product_variants ?? []).map((v: Record<string, unknown>) => mapVariant(v)),
    };
  },

  async create(
    product: {
      handle: string; title: string; body?: string; type: string;
      category?: string; tags?: string; images?: string[]; status?: string;
    },
    variants?: Array<{
      size: string; color?: string | null; price: number;
      comparePrice?: number | null; sku?: string; inventoryQty?: number;
    }>
  ): Promise<Product> {
    const { data: prod, error } = await supabase
      .from("products")
      .insert({
        handle: product.handle,
        title: product.title,
        body: product.body ?? "",
        type: product.type,
        category: product.category ?? "",
        tags: product.tags ?? "",
        images: product.images ?? [],
        status: product.status ?? "active",
      })
      .select()
      .single();

    if (error) throw error;

    if (variants && variants.length > 0) {
      const { error: varErr } = await supabase.from("product_variants").insert(
        variants.map((v) => ({
          product_id: (prod as any).id,
          size: v.size,
          color: v.color ?? null,
          price: Number(v.price),
          compare_price: v.comparePrice != null ? Number(v.comparePrice) : null,
          sku: v.sku ?? "",
          inventory_qty: v.inventoryQty ?? 0,
        }))
      );
      if (varErr) throw varErr;
    }

    return mapProduct(prod as Record<string, unknown>);
  },

  async update(
    id: number,
    patch: {
      handle?: string; title?: string; body?: string; type?: string;
      category?: string; tags?: string; images?: string[]; status?: string;
    }
  ): Promise<Product | null> {
    const update: Record<string, unknown> = {};
    if (patch.handle !== undefined) update.handle = patch.handle;
    if (patch.title !== undefined) update.title = patch.title;
    if (patch.body !== undefined) update.body = patch.body;
    if (patch.type !== undefined) update.type = patch.type;
    if (patch.category !== undefined) update.category = patch.category;
    if (patch.tags !== undefined) update.tags = patch.tags;
    if (patch.images !== undefined) update.images = patch.images;
    if (patch.status !== undefined) update.status = patch.status;

    const { data, error } = await supabase
      .from("products")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) return null;
    return mapProduct(data as Record<string, unknown>);
  },

  async delete(id: number, hard: boolean): Promise<void> {
    if (hard) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("products")
        .update({ status: "draft" })
        .eq("id", id);
      if (error) throw error;
    }
  },

  async replaceVariants(
    productId: number,
    variants: Array<{
      size: string; color?: string | null; price: number;
      comparePrice?: number | null; sku?: string; inventoryQty?: number;
    }>
  ): Promise<void> {
    const { error: delErr } = await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", productId);
    if (delErr) throw delErr;

    if (variants.length > 0) {
      const { error: insErr } = await supabase.from("product_variants").insert(
        variants.map((v) => ({
          product_id: productId,
          size: v.size,
          color: v.color ?? null,
          price: Number(v.price),
          compare_price: v.comparePrice != null ? Number(v.comparePrice) : null,
          sku: v.sku ?? "",
          inventory_qty: v.inventoryQty ?? 0,
        }))
      );
      if (insErr) throw insErr;
    }
  },

  async updateVariantInventory(
    productId: number,
    variantId: number,
    inventoryQty: number
  ): Promise<void> {
    const { data: current, error: fetchErr } = await supabase
      .from("product_variants")
      .select("inventory_qty")
      .eq("id", variantId)
      .single();

    if (fetchErr || !current) throw fetchErr ?? new Error("Variant not found");

    const delta = inventoryQty - (current as any).inventory_qty;

    const { error: updErr } = await supabase
      .from("product_variants")
      .update({ inventory_qty: inventoryQty })
      .eq("id", variantId);
    if (updErr) throw updErr;

    await supabase.from("inventory_logs").insert({
      product_id: productId,
      variant_id: variantId,
      delta,
      reason: "manual_adjustment",
    });
  },
};
