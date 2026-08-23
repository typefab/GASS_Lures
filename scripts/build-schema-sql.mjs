/**
 * Trasforma le migrazioni SQL di drizzle-kit in un modulo TypeScript.
 *
 * Il server legge lo schema da lì invece che dal disco: in ambiente serverless
 * i file non inclusi nel bundle non esistono, quindi incorporarli è più sicuro.
 *
 * Da rieseguire ogni volta che cambi `src/lib/db/schema.ts`:
 *   npm run db:generate
 */
import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";

const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");
const OUTPUT = path.join(process.cwd(), "src", "lib", "db", "schema-sql.ts");

const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();

const statements = [];
for (const file of files) {
  const contents = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
  for (const raw of contents.split("--> statement-breakpoint")) {
    const statement = raw.trim().replace(/;$/, "").trim();
    if (statement) statements.push(idempotent(statement));
  }
}

/** `CREATE TABLE` → `CREATE TABLE IF NOT EXISTS`, così rieseguirla non è un errore. */
function idempotent(statement) {
  return statement
    .replace(/^CREATE TABLE (?!IF NOT EXISTS)/i, "CREATE TABLE IF NOT EXISTS ")
    .replace(/^CREATE UNIQUE INDEX (?!IF NOT EXISTS)/i, "CREATE UNIQUE INDEX IF NOT EXISTS ")
    .replace(/^CREATE INDEX (?!IF NOT EXISTS)/i, "CREATE INDEX IF NOT EXISTS ");
}

const body = `/**
 * FILE GENERATO — non modificare a mano.
 * Prodotto da scripts/build-schema-sql.mjs a partire da drizzle/*.sql
 * Rigeneralo con: npm run db:generate
 */

export const SCHEMA_STATEMENTS: readonly string[] = [
${statements.map((s) => "  " + JSON.stringify(s) + ",").join("\n")}
];
`;

await writeFile(OUTPUT, body, "utf8");
console.log(`✓ ${path.relative(process.cwd(), OUTPUT)} — ${statements.length} istruzioni da ${files.length} migrazione/i`);
