import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products, variants } from "@/lib/db/schema";
import { formatPrice } from "@/lib/format";
import { kindFromCategory } from "@/components/LureArt";
import VariantThumb from "@/components/VariantThumb";

export const dynamic = "force-dynamic";

export const metadata = { title: "Prodotti" };

export default async function AdminProductsPage() {
  const rows = await db
    .select({ product: products, categorySlug: categories.slug, categoryName: categories.name })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(asc(products.sort));

  const allVariants = await db.select().from(variants).orderBy(asc(variants.sort));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="h-display text-3xl">Prodotti</h1>
        <Link href="/admin/prodotti/nuovo" className="rounded-md bg-brass px-5 py-2.5 font-bold text-ink">
          Nuovo prodotto
        </Link>
      </div>

      <ul className="mt-6 divide-y divide-line rounded-lg border border-line">
        {rows.map(({ product, categorySlug, categoryName }) => {
          const vs = allVariants.filter((v) => v.productId === product.id);
          const stock = vs.reduce((n, v) => n + v.stock, 0);
          return (
            <li key={product.id}>
              <Link href={`/admin/prodotti/${product.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-ink-2">
                <div className="w-16 shrink-0 rounded border border-line bg-ink-2 p-1">
                  <VariantThumb
                    imageUrl={vs[0]?.imageUrl}
                    palette={vs[0]?.palette}
                    kind={kindFromCategory(categorySlug)}
                    uid={vs[0]?.id ?? product.id}
                    alt={product.name}
                    className="w-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {product.name}
                    {!product.active && (
                      <span className="ml-2 rounded bg-ink-3 px-1.5 py-0.5 text-[10px] uppercase text-bone-dim">
                        nascosto
                      </span>
                    )}
                    {product.featured && (
                      <span className="ml-2 rounded bg-brass/20 px-1.5 py-0.5 text-[10px] uppercase text-brass">
                        in evidenza
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-bone-dim">
                    {categoryName ?? "senza categoria"} · {vs.length} colorazioni · /{product.slug}
                  </p>
                </div>
                <p className="shrink-0 text-sm tabular-nums">{formatPrice(product.priceCents)}</p>
                <p className={`w-20 shrink-0 text-right text-sm tabular-nums ${stock === 0 ? "text-rust" : "text-bone-dim"}`}>
                  {stock} pz
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
