import { supabase } from "../supabase";
import type { Order, OrderItem, ShippingAddress, PaymentLog } from "./types";

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

function mapPaymentLog(row: Record<string, unknown>): PaymentLog {
  return {
    id: row.id as number,
    orderId: row.order_id as number,
    merchantTransactionId: row.merchant_transaction_id as string,
    phonePeTransactionId: (row.phonepe_transaction_id as string) ?? null,
    amount: row.amount as number,
    status: row.status as string,
    provider: row.provider as string,
    requestPayload: (row.request_payload as Record<string, unknown>) ?? null,
    responsePayload: (row.response_payload as Record<string, unknown>) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const ordersService = {
  async list(params: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
  }): Promise<{ orders: Order[]; page: number; limit: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("orders")
      .select("*")
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (params.status) query = query.eq("status", params.status);
    if (params.paymentStatus) query = query.eq("payment_status", params.paymentStatus);
    if (params.search) {
      const s = params.search.replace(/[%_]/g, "\\$&");
      query = query.or(
        `customer_email.ilike.%${s}%,order_number.ilike.%${s}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return { orders: (data ?? []).map((r) => mapOrder(r as Record<string, unknown>)), page, limit };
  },

  async getByCustomerEmail(email: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_email", email)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => mapOrder(r as Record<string, unknown>));
  },

  async getById(id: number): Promise<(Order & { paymentLogs: PaymentLog[] }) | null> {
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !order) return null;

    const { data: logs } = await supabase
      .from("payment_logs")
      .select("*")
      .eq("order_id", id);

    return {
      ...mapOrder(order as Record<string, unknown>),
      paymentLogs: (logs ?? []).map((r) => mapPaymentLog(r as Record<string, unknown>)),
    };
  },

  async create(input: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: ShippingAddress;
    items: OrderItem[];
  }): Promise<Order> {
    const { customerName, customerEmail, customerPhone, shippingAddress, items } = input;

    // 1. Validate inventory
    for (const item of items) {
      const { data: variant, error } = await supabase
        .from("product_variants")
        .select("inventory_qty, inventory_reserved")
        .eq("id", item.variantId)
        .single();

      if (error || !variant) {
        throw new Error(`Variant ${item.variantId} not found`);
      }
      const available = (variant as any).inventory_qty - (variant as any).inventory_reserved;
      if (available < item.quantity) {
        throw new Error(`Insufficient inventory for ${item.title} (${item.size})`);
      }
    }

    // 2. Compute totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 0;
    const total = subtotal + shipping;

    // 3. Upsert customer
    let customerId: number | null = null;
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("customer_email", customerEmail)
      .single();

    if (existing) {
      customerId = (existing as any).id;
    } else {
      const { data: newCustomer, error: custErr } = await supabase
        .from("customers")
        .insert({ name: customerName, customer_email: customerEmail, phone: customerPhone })
        .select("id")
        .single();
      if (custErr) throw custErr;
      customerId = (newCustomer as any).id;
    }

    // 4. Generate order number
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });
    const orderNumber = `PE-${1000 + (count ?? 0) + 1}`;

    // 5. Insert order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        items,
        subtotal,
        shipping,
        total,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();
    if (orderErr) throw orderErr;

    // 6. Reserve inventory (best-effort, atomic via SQL function)
    for (const item of items) {
      await supabase.rpc("reserve_inventory", {
        p_variant_id: item.variantId,
        p_qty: item.quantity,
      });
    }

    return mapOrder(order as Record<string, unknown>);
  },

  async updateStatus(id: number, status: string, notes?: string): Promise<Order | null> {
    const update: Record<string, unknown> = { status };
    if (notes !== undefined) update.notes = notes;

    const { data, error } = await supabase
      .from("orders")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) return null;
    return mapOrder(data as Record<string, unknown>);
  },
};
