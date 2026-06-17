import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import * as productsSchema from "./schema/products";
import * as categoriesSchema from "./schema/categories";
import * as ordersSchema from "./schema/orders";
import * as customersSchema from "./schema/customers";
import * as settingsSchema from "./schema/settings";
import * as relationsSchema from "./schema/relations";

const schema = {
  ...productsSchema,
  ...categoriesSchema,
  ...ordersSchema,
  ...customersSchema,
  ...settingsSchema,
  ...relationsSchema,
};

// Resolve DB file path relative to workspace root so it works both when
// running from artifacts/api-server (dev) and from the workspace root (prod).
const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const dbPath = path.resolve(workspaceRoot, "papillon.db");

const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrent read performance (Postgres-compatible pattern)
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

export * from "./schema/products";
export * from "./schema/categories";
export * from "./schema/orders";
export * from "./schema/customers";
export * from "./schema/settings";
export * from "./schema/relations";
export * from "drizzle-orm";
