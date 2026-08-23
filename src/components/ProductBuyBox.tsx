"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import LureArt from "./LureArt";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/format";

export type BuyBoxVariant = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  palette: string;
  imageUrl: string;
  priceCents: number;
};

type Props = {
  productSlug: string;
  productName: string;
  kind: string;
  variants: BuyBoxVariant[];
};

export default function ProductBuyBox({ productSlug, productName, kind, variants }: Props) {
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];
  const [selectedId, setSelectedId] = useState(firstAvailable?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const { add, lastAdded } = useCart();

  const selected = useMemo(
    () => variants.find((v) => v.id === selectedId) ?? firstAvailable,
    [variants, selectedId, firstAvailable],
  );

  if (!selected) {
    return <p className="text-bone-dim">Questo prodotto non è al momento configurabile.</p>;
  }

  const soldOut = selected.stock <= 0;
  const maxQty = Math.max(1, Math.min(selected.stock, 10));
  const justAdded = lastAdded === selected.id;

  function onAdd() {
    if (!selected || soldOut) return;
    add(
      {
        variantId: selected.id,
        productSlug,
        productName,
        variantName: selected.name,
        priceCents: selected.priceCents,
        palette: selected.palette,
        kind,
        maxQuantity: selected.stock,
      },
      quantity,
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Anteprima della colorazione selezionata */}
      <div>
        <div className="overflow-hidden rounded-xl border border-line bg-ink-2 p-6">
          {selected.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selected.imageUrl} alt={`${productName} — ${selected.name}`} className="w-full rounded-lg" />
          ) : (
            <LureArt
              palette={selected.palette}
              kind={kind as never}
              uid={selected.id}
              className="w-full"
              label={`${productName} nella colorazione ${selected.name}`}
            />
          )}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                setSelectedId(v.id);
                setQuantity(1);
              }}
              aria-pressed={v.id === selected.id}
              title={v.name}
              className={`overflow-hidden rounded-md border bg-ink-2 p-1 transition-colors ${
                v.id === selected.id ? "border-brass" : "border-line hover:border-bone-dim"
              } ${v.stock <= 0 ? "opacity-50" : ""}`}
            >
              <LureArt palette={v.palette} kind={kind as never} uid={v.id} className="w-full" />
              <span className="sr-only">{v.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selezione e acquisto */}
      <div>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-3xl font-semibold">{formatPrice(selected.priceCents)}</span>
          <span className="text-sm text-bone-dim">IVA inclusa</span>
        </div>

        <fieldset className="mt-7">
          <legend className="eyebrow">
            Colorazione: <span className="text-bone">{selected.name}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setSelectedId(v.id);
                  setQuantity(1);
                }}
                aria-pressed={v.id === selected.id}
                disabled={v.stock <= 0}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  v.id === selected.id
                    ? "border-brass bg-brass font-semibold text-ink"
                    : "border-line text-bone-dim hover:border-brass hover:text-bone"
                } disabled:cursor-not-allowed disabled:line-through disabled:opacity-40`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </fieldset>

        <p className="mt-4 text-sm">
          {soldOut ? (
            <span className="text-rust">Esaurito — questa colorazione tornerà con la prossima serie.</span>
          ) : selected.stock <= 3 ? (
            <span className="text-brass">Ultimi {selected.stock} pezzi disponibili</span>
          ) : (
            <span className="text-bone-dim">Disponibile · {selected.stock} pezzi in laboratorio</span>
          )}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-md border border-line">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={soldOut || quantity <= 1}
              className="px-3.5 py-2.5 text-lg leading-none disabled:opacity-40"
              aria-label="Diminuisci la quantità"
            >
              −
            </button>
            <span className="min-w-10 text-center tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={soldOut || quantity >= maxQty}
              className="px-3.5 py-2.5 text-lg leading-none disabled:opacity-40"
              aria-label="Aumenta la quantità"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={onAdd}
            disabled={soldOut}
            className="flex-1 rounded-md bg-brass px-6 py-3 font-bold text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {soldOut ? "Esaurito" : "Aggiungi al carrello"}
          </button>
        </div>

        <p className="mt-3 min-h-5 text-sm text-brass-soft" role="status">
          {justAdded && (
            <>
              Aggiunto al carrello.{" "}
              <Link href="/carrello" className="font-semibold underline">
                Vai al carrello
              </Link>
            </>
          )}
        </p>

        <p className="mt-2 text-xs text-bone-dim">SKU {selected.sku}</p>
      </div>
    </div>
  );
}
