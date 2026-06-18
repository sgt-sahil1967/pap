import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type StoreVariant = {
  id: number;
  product_id: number;
  size: string;
  color: string | null;
  price: number;
  compare_price: number | null;
  sku: string;
  inventory_qty: number;
  inventory_reserved: number;
};

export type StoreProduct = {
  id: number;
  handle: string;
  title: string;
  body: string;
  type: string;
  category: string;
  tags: string;
  images: string[];
  status: string;
  created_at: string;
  product_variants: StoreVariant[];
};
