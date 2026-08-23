import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const explicitUrl = process.env.DATABASE_URL;

/**
 * Se nessun database è configurato e siamo in produzione, il sito parte
 * comunque usando un file temporaneo: è la "modalità anteprima", pensata per
 * pubblicare online in un clic e provare tutto dal telefono.
 * I dati sopravvivono finché il server resta caldo, poi si azzerano.
 * Basta impostare DATABASE_URL (Turso) perché tutto diventi permanente.
 */
export const isPreviewDatabase = !explicitUrl && process.env.NODE_ENV === "production";

const url = explicitUrl || (isPreviewDatabase ? "file:/tmp/gass-preview.db" : "file:./data/gass.db");
const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

// In dev Next ricarica i moduli a ogni modifica: riusiamo la stessa connessione.
const globalForDb = globalThis as unknown as { __gassDb?: ReturnType<typeof drizzle> };

export const db = globalForDb.__gassDb ?? drizzle(createClient({ url, authToken }), { schema });

if (process.env.NODE_ENV !== "production") globalForDb.__gassDb = db;

export { schema };
