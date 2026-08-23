import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Nuovo prodotto" };

export default async function NewProductPage() {
  const cats = await db.select().from(categories).orderBy(asc(categories.sort));

  return (
    <div className="max-w-3xl">
      <Link href="/admin/prodotti" className="text-sm text-bone-dim hover:text-bone">
        ← Tutti i prodotti
      </Link>
      <h1 className="h-display mt-3 text-3xl">Nuovo prodotto</h1>
      <p className="mt-2 text-sm text-bone-dim">
        Dopo averlo creato potrai aggiungere le colorazioni: sono loro ad avere SKU e giacenza.
      </p>
      <div className="mt-8">
        <ProductForm categories={cats} />
      </div>
    </div>
  );
}
