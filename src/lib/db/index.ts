import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.DATABASE_URL || "file:./data/gass.db";
const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

// In dev Next ricarica i moduli a ogni modifica: riusiamo la stessa connessione.
const globalForDb = globalThis as unknown as { __gassDb?: ReturnType<typeof drizzle> };

export const db =
  globalForDb.__gassDb ??
  drizzle(createClient({ url, authToken }), { schema });

if (process.env.NODE_ENV !== "production") globalForDb.__gassDb = db;

export { schema };
