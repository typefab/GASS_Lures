import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductBuyBox from "@/components/ProductBuyBox";
import ProductCard from "@/components/ProductCard";
import { kindFromCategory } from "@/components/LureArt";
import { getProductBySlug, getRelated } from "@/lib/catalog";
import { ACTION_LABELS, formatLength, formatPrice, formatWeight } from "@/lib/format";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Prodotto non trovato" };
  return {
    title: product.name,
    description: product.tagline || product.description.slice(0, 160),
    openGraph: { title: `${product.name} · ${site.name}`, description: product.tagline },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelated(product.id, product.categoryId, 4);
  const kind = kindFromCategory(product.categorySlug);

  const specs = [
    ["Lunghezza", formatLength(product.lengthMm)],
    ["Peso", formatWeight(product.weightDg)],
    ["Assetto", ACTION_LABELS[product.action] ?? null],
    ["Profondità di lavoro", product.depthM || null],
    ["Armamento", product.hooks || null],
    ["Colorazioni", product.variants.length ? `${product.variants.length} disponibili` : null],
  ].filter((r): r is [string, string] => Boolean(r[1]));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.tagline || product.description.slice(0, 300),
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: site.currency,
      availability: product.stockTotal > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav aria-label="Percorso" className="text-sm text-bone-dim">
        <Link href="/" className="hover:text-bone">Home</Link>
        <span className="px-2">/</span>
        <Link href="/shop" className="hover:text-bone">Shop</Link>
        {product.categorySlug && (
          <>
            <span className="px-2">/</span>
            <Link href={`/shop?categoria=${product.categorySlug}`} className="hover:text-bone">
              {product.categoryName}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6">
        {product.categoryName && <p className="eyebrow">{product.categoryName}</p>}
        <h1 className="h-display mt-2 text-4xl sm:text-5xl">{product.name}</h1>
        <p className="mt-2 text-lg text-bone-dim">{product.tagline}</p>
        {product.compareAtCents && product.compareAtCents > product.priceCents && (
          <p className="mt-2 text-sm text-rust">
            In promozione: prima {formatPrice(product.compareAtCents)}
          </p>
        )}
      </div>

      <div className="mt-10">
        <ProductBuyBox
          productSlug={product.slug}
          productName={product.name}
          kind={kind}
          variants={product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            stock: v.stock,
            palette: v.palette,
            imageUrl: v.imageUrl,
            priceCents: product.priceCents + v.priceDeltaCents,
          }))}
        />
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="h-display text-2xl">Descrizione</h2>
          <div className="mt-4 space-y-4 leading-relaxed text-bone-dim">
            {product.description.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        {specs.length > 0 && (
          <section>
            <h2 className="h-display text-2xl">Scheda tecnica</h2>
            <dl className="mt-4 divide-y divide-line rounded-lg border border-line">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-3 text-sm">
                  <dt className="text-bone-dim">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 rounded-lg border border-line bg-ink-2 p-4 text-sm text-bone-dim">
              <p className="font-semibold text-bone">Spedizione</p>
              <p className="mt-1">
                Gratuita in Italia sopra {formatPrice(site.shipping.freeThresholdCents)}, altrimenti{" "}
                {formatPrice(site.shipping.zones[0].priceCents)}. Consegna in {site.shipping.zones[0].days}.
              </p>
            </div>
          </section>
        )}
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="h-display text-2xl">Potrebbe interessarti</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
