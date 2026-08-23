/**
 * Ricarica il catalogo di esempio.
 * Uso: npm run db:seed
 *
 * Cancella e ricrea prodotti, colorazioni e categorie. NON tocca gli ordini.
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import { seedCatalog } from "./catalog-seed";

async function main() {
  console.log("→ Ricarico il catalogo…");
  const counts = await seedCatalog({ replace: true });
  console.log("✓ Catalogo caricato:", counts);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
