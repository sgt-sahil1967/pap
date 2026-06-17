import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Schema designed for Postgres compatibility:
//   integer primaryKey autoIncrement  →  serial primary key
//   text                              →  text
//   integer { mode:'timestamp' }      →  timestamp
//   text { mode:'json' }              →  jsonb
//   real                              →  numeric(10,2)

export const productsTable = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  handle: text("handle").notNull().unique(),
  title: text("title").notNull(),
  body: text("body").default(""),
  type: text("type").notNull().default(""),
  category: text("category").default(""),
  tags: text("tags").default(""),
  images: text("images", { mode: "json" }).notNull().default("[]").$type<string[]>(),
  status: text("status").notNull().default("active"), // "active" | "draft"
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$default(() => new Date()).$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

export const productVariantsTable = sqliteTable("product_variants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
  size: text("size").notNull().default(""),
  color: text("color").default(""),
  price: real("price").notNull(),
  comparePrice: real("compare_price"),
  sku: text("sku").default(""),
  inventoryQty: integer("inventory_qty").notNull().default(0),
  inventoryReserved: integer("inventory_reserved").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$default(() => new Date()).$onUpdate(() => new Date()),
});

export const insertProductVariantSchema = createInsertSchema(productVariantsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type ProductVariant = typeof productVariantsTable.$inferSelect;

export const inventoryLogsTable = sqliteTable("inventory_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  variantId: integer("variant_id").notNull(),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(), // "sale" | "manual_adjustment" | "return" | "reservation"
  orderId: integer("order_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => new Date()),
});

export const insertInventoryLogSchema = createInsertSchema(inventoryLogsTable).omit({ id: true, createdAt: true });
export type InsertInventoryLog = z.infer<typeof insertInventoryLogSchema>;
export type InventoryLog = typeof inventoryLogsTable.$inferSelect;
