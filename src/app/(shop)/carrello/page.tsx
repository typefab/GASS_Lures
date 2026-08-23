"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LureArt from "@/components/LureArt";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

export default function CartPage() {
  const { lines, ready, setQuantity, remove, subtotalCents, count } = useCart();
  const [issues, setIssues] = useState<string[]>([]);

  // Riallinea prezzi e giacenze con il server: il carrello vive nel browser
  // e può essere rimasto fermo per giorni.
  useEffect(() => {
    if (!ready || lines.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })) }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setIssues(data.issues ?? []);
        for (const line of lines) {
          const server = data.lines.find((l: { variantId: string }) => l.variantId === line.variantId);
          if (!server) remove(line.variantId);
          else if (server.quantity !== line.quantity) setQuantity(line.variantId, server.quantity);
        }
      } catch {
        /* offline: mostriamo comunque il carrello locale */
      }
    })();
    return () => {
      cancelled = true;
    };
    // Volutamente solo al montaggio: evita un ciclo di aggiornamenti continui.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const freeShipping = subtotalCents >= site.shipping.freeThresholdCents;
  const missingForFree = site.shipping.freeThresholdCents - subtotalCents;
  const shippingCents = freeShipping ? 0 : site.shipping.zones[0].priceCents;

  if (!ready) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-bone-dim">Carico il carrello…</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="h-display text-4xl">Il carrello è vuoto</h1>
        <p className="mt-3 text-bone-dim">Le esche migliori non si comprano da sole. Dai un&apos;occhiata al catalogo.</p>
        <Link href="/shop" className="mt-8 inline-block rounded-md bg-brass px-6 py-3 font-bold text-ink">
          Vai al catalogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="h-display text-4xl">Carrello</h1>
      <p className="mt-2 text-bone-dim">
        {count} {count === 1 ? "articolo" : "articoli"}
      </p>

      {issues.length > 0 && (
        <ul className="mt-6 space-y-1 rounded-lg border border-rust/50 bg-rust/10 p-4 text-sm" role="status">
          {issues.map((i, n) => (
            <li key={n}>{i}</li>
          ))}
        </ul>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-line rounded-lg border border-line">
          {lines.map((line) => (
            <li key={line.variantId} className="flex gap-4 p-4">
              <div className="w-24 shrink-0 rounded-md border border-line bg-ink-2 p-1.5 sm:w-32">
                <LureArt palette={line.palette} kind={line.kind as never} uid={line.variantId} className="w-full" />
              </div>

              <div className="min-w-0 flex-1">
                <Link href={`/prodotti/${line.productSlug}`} className="h-display text-lg hover:text-brass">
                  {line.productName}
                </Link>
                <p className="text-sm text-bone-dim">{line.variantName}</p>
                <p className="mt-1 text-sm">{formatPrice(line.priceCents)} cad.</p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-md border border-line">
                    <button
                      type="button"
                      onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                      className="px-3 py-1.5 leading-none"
                      aria-label={`Riduci la quantità di ${line.productName}`}
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center tabular-nums">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                      disabled={line.quantity >= line.maxQuantity}
                      className="px-3 py-1.5 leading-none disabled:opacity-40"
                      aria-label={`Aumenta la quantità di ${line.productName}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(line.variantId)}
                    className="text-sm text-bone-dim underline hover:text-rust"
                  >
                    Rimuovi
                  </button>
                </div>
              </div>

              <p className="shrink-0 font-display text-lg font-semibold tabular-nums">
                {formatPrice(line.priceCents * line.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-lg border border-line bg-ink-2 p-6 lg:sticky lg:top-32">
          <h2 className="h-display text-xl">Riepilogo</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-bone-dim">Subtotale</dt>
              <dd className="tabular-nums">{formatPrice(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-bone-dim">Spedizione (Italia)</dt>
              <dd className="tabular-nums">{freeShipping ? "Gratuita" : formatPrice(shippingCents)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
              <dt>Totale</dt>
              <dd className="tabular-nums">{formatPrice(subtotalCents + shippingCents)}</dd>
            </div>
          </dl>

          {!freeShipping && (
            <p className="mt-4 rounded-md border border-line p-3 text-xs text-bone-dim">
              Ti mancano <strong className="text-brass">{formatPrice(missingForFree)}</strong> per la spedizione gratuita.
            </p>
          )}

          <Link
            href="/checkout"
            className="mt-6 block rounded-md bg-brass px-6 py-3 text-center font-bold text-ink transition-opacity hover:opacity-90"
          >
            Vai alla cassa
          </Link>
          <Link href="/shop" className="mt-3 block text-center text-sm text-bone-dim underline hover:text-bone">
            Continua a comprare
          </Link>
        </aside>
      </div>
    </div>
  );
}
