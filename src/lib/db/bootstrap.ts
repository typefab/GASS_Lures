import "server-only";
import { sql } from "drizzle-orm";
import { db, isPreviewDatabase } from "./index";
import { SCHEMA_STATEMENTS } from "./schema-sql";

/**
 * Prepara il database all'avvio del server.
 *
 * - se le tabelle non esistono, le crea
 * - se il database è appena nato, carica il catalogo di esempio
 *
 * Serve a far funzionare il sito al primo deploy senza nessun comando manuale.
 * Su un database già popolato non fa assolutamente nulla.
 */

let started: Promise<void> | null = null;

export function ensureDatabase() {
  started ??= run();
  return started;
}

async function run() {
  try {
    if (await hasTables()) return;

    for (const statement of SCHEMA_STATEMENTS) {
      await db.run(sql.raw(statement));
    }
    console.info(`[db] schema creato (${SCHEMA_STATEMENTS.length} istruzioni).`);

    // Database appena creato: lo riempiamo, altrimenti il negozio sarebbe vuoto.
    const { seedCatalog } = await import("./catalog-seed");
    const counts = await seedCatalog();
    console.info("[db] catalogo iniziale caricato:", counts);

    if (isPreviewDatabase) {
      console.warn(
        "[db] MODALITÀ ANTEPRIMA: database temporaneo in /tmp. Imposta DATABASE_URL (Turso) per rendere permanenti ordini e prodotti.",
      );
    }
  } catch (err) {
    // Un errore qui non deve impedire al sito di rispondere: le pagine
    // mostreranno il proprio errore, molto più leggibile di una schermata bianca.
    console.error("[db] preparazione del database non riuscita:", err);
  }
}

async function hasTables() {
  // `all` invece di `get`: con zero righe `get` non restituisce un risultato mappabile.
  const rows = await db.all<{ name: string }>(
    sql`select name from sqlite_master where type = 'table' and name = 'products'`,
  );
  return rows.length > 0;
}
