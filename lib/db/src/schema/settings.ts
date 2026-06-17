import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const homepageSettingsTable = sqliteTable("homepage_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  banners: text("banners", { mode: "json" }).notNull().default("[]").$type<Array<{
    id: string; imageUrl: string; link: string; alt: string; enabled: boolean;
  }>>(),
  announcementText: text("announcement_text").notNull().default("Free Shipping On Any 2 Purchases!"),
  announcementEnabled: integer("announcement_enabled", { mode: "boolean" }).notNull().default(true),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$default(() => new Date()).$onUpdate(() => new Date()),
});

export const insertHomepageSettingsSchema = createInsertSchema(homepageSettingsTable).omit({ id: true, updatedAt: true });
export type InsertHomepageSettings = z.infer<typeof insertHomepageSettingsSchema>;
export type HomepageSettings = typeof homepageSettingsTable.$inferSelect;

export const adminSessionsTable = sqliteTable("admin_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => new Date()),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const insertAdminSessionSchema = createInsertSchema(adminSessionsTable).omit({ id: true, createdAt: true });
export type InsertAdminSession = z.infer<typeof insertAdminSessionSchema>;
export type AdminSession = typeof adminSessionsTable.$inferSelect;
