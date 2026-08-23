import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products, variants } from "@/lib/db/schema";
import ProductForm from "@/components/admin/ProductForm";
import VariantEditor from "@/components/admin/VariantEditor";
import { kindFromCategory } from "@/components/LureArt";
import { deleteProduct } from "../../actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Modifica prodotto" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ salvato?: string }>;
}) {
  const { id } = await params;
  const { salvato } = await searchParams;

  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) notFound();

  const [cats, vs] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sort)),
    db.select().from(variants).where(eq(variants.productId, id)).orderBy(asc(variants.sort)),
  ]);

  const category = cats.find((c) => c.id === product.categoryId);

  return (
    <div>
      <Link href="/admin/prodotti" className="text-sm text-bone-dim hover:text-bone">
        ← Tutti i prodotti
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="h-display text-3xl">{product.name}</h1>
        <Link href={`/prodotti/${product.slug}`} className="text-sm text-brass hover:underline">
          Vedi sul sito ↗
        </Link>
      </div>

      {salvato && (
        <p className="mt-4 rounded-md border border-brass/50 bg-brass/10 p-3 text-sm text-brass" role="status">
          Modifiche salvate.
        </p>
      )}

      <div className="mt-8 max-w-3xl">
        <ProductForm product={product} categories={cats} />
      </div>

      <section className="mt-14">
        <h2 className="h-display text-2xl">Colorazioni</h2>
        <p className="mt-1.5 text-sm text-bone-dim">
          Ogni colorazione ha SKU e giacenza propri. I quattro colori generano l&apos;illustrazione mostrata sul
          sito: appena inserisci l&apos;URL di una foto reale, quella sostituisce il disegno.
        </p>
        <div className="mt-5">
          <VariantEditor productId={product.id} kind={kindFromCategory(category?.slug)} variants={vs} />
        </div>
      </section>

      <section className="mt-14 rounded-lg border border-rust/40 p-5">
        <h2 className="h-display text-lg text-rust">Elimina prodotto</h2>
        <p className="mt-1.5 text-sm text-bone-dim">
          L&apos;operazione cancella il prodotto e tutte le sue colorazioni. Gli ordini già registrati non vengono
          toccati. Se vuoi solo toglierlo dal sito, togli la spunta “Visibile sul sito” qui sopra.
        </p>
        <form action={deleteProduct} className="mt-4">
          <input type="hidden" name="id" value={product.id} />
          <button type="submit" className="rounded-md border border-rust px-4 py-2 text-sm font-semibold text-rust hover:bg-rust hover:text-bone">
            Elimina definitivamente
          </button>
        </form>
      </section>
    </div>
  );
}
