import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("order_number").notNull().unique(),
  customerId: integer("customer_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  shippingAddress: text("shipping_address", { mode: "json" }).notNull().$type<{
    line1: string; line2?: string; city: string; state: string; pincode: string; country: string;
  }>(),
  items: text("items", { mode: "json" }).notNull().$type<Array<{
    productId: string; variantId: number; title: string; size: string;
    price: number; quantity: number; image: string;
  }>>(),
  subtotal: real("subtotal").notNull(),
  shipping: real("shipping").notNull().default(0),
  total: real("total").notNull(),
  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$default(() => new Date()).$onUpdate(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

export const paymentLogsTable = sqliteTable("payment_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  merchantTransactionId: text("merchant_transaction_id").notNull().unique(),
  phonePeTransactionId: text("phonepe_transaction_id"),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("INITIATED"),
  provider: text("provider").notNull().default("phonepe"),
  requestPayload: text("request_payload", { mode: "json" }).$type<Record<string, unknown>>(),
  responsePayload: text("response_payload", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$default(() => new Date()).$onUpdate(() => new Date()),
});

export const insertPaymentLogSchema = createInsertSchema(paymentLogsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPaymentLog = z.infer<typeof insertPaymentLogSchema>;
export type PaymentLog = typeof paymentLogsTable.$inferSelect;
