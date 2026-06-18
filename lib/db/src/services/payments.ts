import { supabase } from "../supabase";
import type { PaymentLog, Order, ShippingAddress, OrderItem } from "./types";

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

export const paymentsService = {
  async createLog(data: {
    orderId: number;
    merchantTransactionId: string;
    amount: number;
    requestPayload?: Record<string, unknown>;
  }): Promise<void> {
    const { error } = await supabase.from("payment_logs").insert({
      order_id: data.orderId,
      merchant_transaction_id: data.merchantTransactionId,
      amount: data.amount,
      status: "INITIATED",
      request_payload: data.requestPayload ?? null,
    });
    if (error) throw error;
  },

  async getLogByMerchantId(merchantTransactionId: string): Promise<PaymentLog | null> {
    const { data, error } = await supabase
      .from("payment_logs")
      .select("*")
      .eq("merchant_transaction_id", merchantTransactionId)
      .single();

    if (error || !data) return null;
    return mapPaymentLog(data as Record<string, unknown>);
  },

  async updateLog(
    id: number,
    patch: {
      status?: string;
      phonePeTransactionId?: string;
      responsePayload?: Record<string, unknown>;
    }
  ): Promise<void> {
    const update: Record<string, unknown> = {};
    if (patch.status !== undefined) update.status = patch.status;
    if (patch.phonePeTransactionId !== undefined) update.phonepe_transaction_id = patch.phonePeTransactionId;
    if (patch.responsePayload !== undefined) update.response_payload = patch.responsePayload;

    const { error } = await supabase.from("payment_logs").update(update).eq("id", id);
    if (error) throw error;
  },

  async handlePaymentSuccess(paymentLogId: number, orderId: number, items: OrderItem[]): Promise<void> {
    await supabase
      .from("orders")
      .update({ payment_status: "paid", status: "confirmed" })
      .eq("id", orderId);

    for (const item of items) {
      await supabase.rpc("deduct_on_sale", {
        p_variant_id: item.variantId,
        p_qty: item.quantity,
      });

      await supabase.from("inventory_logs").insert({
        product_id: Number(item.productId),
        variant_id: item.variantId,
        delta: -item.quantity,
        reason: "sale",
        order_id: orderId,
      });
    }
  },

  async handlePaymentFailure(orderId: number, items: OrderItem[]): Promise<void> {
    await supabase
      .from("orders")
      .update({ payment_status: "failed" })
      .eq("id", orderId);

    for (const item of items) {
      await supabase.rpc("release_reservation", {
        p_variant_id: item.variantId,
        p_qty: item.quantity,
      });
    }
  },

  async getOrderById(orderId: number): Promise<Order | null> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (error || !data) return null;
    return mapOrder(data as Record<string, unknown>);
  },
};
