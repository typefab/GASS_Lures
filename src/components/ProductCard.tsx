import Link from "next/link";
import LureArt, { kindFromCategory } from "./LureArt";
import { formatPrice, formatLength, formatWeight } from "@/lib/format";
import type { Product, Variant } from "@/lib/db/schema";

export type CardProduct = Product & {
  categorySlug: string | null;
  categoryName: string | null;
  variants: Variant[];
  stockTotal: number;
};

export default function ProductCard({ product }: { product: CardProduct }) {
  const first = product.variants[0];
  const soldOut = product.stockTotal <= 0;
  const onSale = !!product.compareAtCents && product.compareAtCents > product.priceCents;
  const kind = kindFromCategory(product.categorySlug);

  return (
    <Link
      href={`/prodotti/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-ink-2 transition-colors hover:border-brass/60"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-ink-3">
        {first?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={first.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <LureArt
            palette={first?.palette}
            kind={kind}
            uid={first?.id ?? product.id}
            className="h-full w-full p-4 transition-transform duration-500 group-hover:scale-105"
          />
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {onSale && !soldOut && (
            <span className="rounded bg-rust px-2 py-1 text-[11px] font-bold uppercase tracking-wide">Promo</span>
          )}
          {product.featured && !onSale && !soldOut && (
            <span className="rounded bg-brass px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">Best seller</span>
          )}
          {soldOut && (
            <span className="rounded bg-ink px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-bone-dim">Esaurito</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.categoryName && <p className="eyebrow">{product.categoryName}</p>}
        <h3 className="h-display mt-1.5 text-lg text-bone">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-bone-dim">{product.tagline}</p>

        {(product.lengthMm || product.weightDg) && (
          <p className="mt-2 text-xs text-bone-dim/80">
            {[formatLength(product.lengthMm), formatWeight(product.weightDg)].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="mt-3 flex items-center gap-1.5">
          {product.variants.slice(0, 6).map((v) => {
            const colors = safeColors(v.palette);
            return (
              <span
                key={v.id}
                title={v.name}
                className="h-3.5 w-3.5 rounded-full border border-line"
                style={{ background: `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)` }}
              />
            );
          })}
          {product.variants.length > 6 && (
            <span className="text-xs text-bone-dim">+{product.variants.length - 6}</span>
          )}
        </div>

        <div className="mt-4 flex items-baseline gap-2 pt-2">
          <span className="font-display text-xl font-semibold text-bone">{formatPrice(product.priceCents)}</span>
          {onSale && (
            <span className="text-sm text-bone-dim line-through">{formatPrice(product.compareAtCents!)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function safeColors(raw: string): string[] {
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p) && p.length >= 2) return p.map(String);
  } catch {
    /* palette non valida: usiamo il colore di riserva */
  }
  return ["#5c7f96", "#f2f2ef"];
}
