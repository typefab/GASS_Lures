import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

const url = process.env.DATABASE_URL || "file:./data/gass.db";
const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;
const isLocalFile = url.startsWith("file:");

export default defineConfig(
  isLocalFile
    ? { schema: "./src/lib/db/schema.ts", out: "./drizzle", dialect: "sqlite", dbCredentials: { url } }
    : { schema: "./src/lib/db/schema.ts", out: "./drizzle", dialect: "turso", dbCredentials: { url, authToken } },
);
