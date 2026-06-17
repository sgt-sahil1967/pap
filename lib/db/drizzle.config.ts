import { defineConfig } from "drizzle-kit";
import path from "path";

const workspaceRoot = process.cwd().endsWith(path.join("lib", "db"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "sqlite",
  dbCredentials: {
    url: path.resolve(workspaceRoot, "papillon.db"),
  },
});
