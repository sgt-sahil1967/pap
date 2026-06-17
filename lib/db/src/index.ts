import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as productsSchema from "./schema/products";
import * as categoriesSchema from "./schema/categories";
import * as ordersSchema from "./schema/orders";
import * as customersSchema from "./schema/customers";
import * as settingsSchema from "./schema/settings";

const schema = {
  ...productsSchema,
  ...categoriesSchema,
  ...ordersSchema,
  ...customersSchema,
  ...settingsSchema,
};

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema/products";
export * from "./schema/categories";
export * from "./schema/orders";
export * from "./schema/customers";
export * from "./schema/settings";
export * from "drizzle-orm";
