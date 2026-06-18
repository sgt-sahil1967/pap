import { supabase } from "../supabase";
import type { Customer, Order, ShippingAddress, OrderItem } from "./types";

function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: row.id as number,
    name: row.name as string,
    email: row.customer_email as string,
    phone: (row.phone as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as number,
    orderNumber: row.order_number as string,
    customerId: (row.customer_id as number) ?? null,
    customerName: row.customer_name as string,
    customerEmail: row.customer_email as string,
    customerPhone: row.customer_phone as string,
    shippingAddress: row.shipping_address as ShippingAddress,
    items: (row.items as OrderItem[]) ?? [],
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    status: row.status as string,
    paymentStatus: row.payment_status as string,
    notes: (row.notes as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const customersService = {
  async list(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ customers: Customer[]; page: number; limit: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("customers")
      .select("*")
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (params.search) {
      query = query.ilike("name", `%${params.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return {
      customers: (data ?? []).map((r) => mapCustomer(r as Record<string, unknown>)),
      page,
      limit,
    };
  },

  async getById(id: number): Promise<(Customer & { orders: Order[] }) | null> {
    const { data: customer, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !customer) return null;

    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", id)
      .order("created_at", { ascending: false });

    return {
      ...mapCustomer(customer as Record<string, unknown>),
      orders: (orders ?? []).map((r) => mapOrder(r as Record<string, unknown>)),
    };
  },
};
