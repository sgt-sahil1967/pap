import { pgTable, text, serial, integer, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(), // e.g. "PE-1001"
  customerId: integer("customer_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  shippingAddress: jsonb("shipping_address").notNull().$type<{
    line1: string; line2?: string; city: string; state: string; pincode: string; country: string;
  }>(),
  items: jsonb("items").notNull().$type<Array<{
    productId: string; variantId: number; title: string; size: string;
    price: number; quantity: number; image: string;
  }>>(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  // pending | confirmed | processing | shipped | delivered | cancelled
  paymentStatus: text("payment_status").notNull().default("pending"),
  // pending | paid | failed | refunded
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

export const paymentLogsTable = pgTable("payment_logs", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  merchantTransactionId: text("merchant_transaction_id").notNull().unique(),
  phonePeTransactionId: text("phonepe_transaction_id"),
  amount: integer("amount").notNull(), // in paise
  status: text("status").notNull().default("INITIATED"),
  // INITIATED | PAYMENT_SUCCESS | PAYMENT_ERROR | PAYMENT_PENDING | TIMED_OUT
  provider: text("provider").notNull().default("phonepe"),
  requestPayload: jsonb("request_payload").$type<Record<string, unknown>>(),
  responsePayload: jsonb("response_payload").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPaymentLogSchema = createInsertSchema(paymentLogsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPaymentLog = z.infer<typeof insertPaymentLogSchema>;
export type PaymentLog = typeof paymentLogsTable.$inferSelect;
