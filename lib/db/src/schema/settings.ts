import { pgTable, serial, text, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const homepageSettingsTable = pgTable("homepage_settings", {
  id: serial("id").primaryKey(),
  banners: jsonb("banners").notNull().default([]).$type<Array<{
    id: string; imageUrl: string; link: string; alt: string; enabled: boolean;
  }>>(),
  announcementText: text("announcement_text").notNull().default("Free Shipping On Any 2 Purchases!"),
  announcementEnabled: boolean("announcement_enabled").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertHomepageSettingsSchema = createInsertSchema(homepageSettingsTable).omit({ id: true, updatedAt: true });
export type InsertHomepageSettings = z.infer<typeof insertHomepageSettingsSchema>;
export type HomepageSettings = typeof homepageSettingsTable.$inferSelect;

export const adminSessionsTable = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertAdminSessionSchema = createInsertSchema(adminSessionsTable).omit({ id: true, createdAt: true });
export type InsertAdminSession = z.infer<typeof insertAdminSessionSchema>;
export type AdminSession = typeof adminSessionsTable.$inferSelect;
