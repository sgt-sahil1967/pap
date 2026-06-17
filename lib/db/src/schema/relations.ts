import { relations } from "drizzle-orm";
import { productsTable, productVariantsTable, inventoryLogsTable } from "./products";
import { ordersTable, paymentLogsTable } from "./orders";
import { customersTable } from "./customers";

export const productsRelations = relations(productsTable, ({ many }) => ({
  variants: many(productVariantsTable),
}));

export const productVariantsRelations = relations(productVariantsTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [productVariantsTable.productId],
    references: [productsTable.id],
  }),
}));

export const ordersRelations = relations(ordersTable, ({ many, one }) => ({
  paymentLogs: many(paymentLogsTable),
  customer: one(customersTable, {
    fields: [ordersTable.customerId],
    references: [customersTable.id],
  }),
}));

export const paymentLogsRelations = relations(paymentLogsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [paymentLogsTable.orderId],
    references: [ordersTable.id],
  }),
}));

export const customersRelations = relations(customersTable, ({ many }) => ({
  orders: many(ordersTable),
}));
