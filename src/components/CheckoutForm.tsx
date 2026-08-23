"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import LureArt from "./LureArt";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

type Props = { paymentsLive: boolean; testMode: boolean; cancelled: boolean };

type Totals = { subtotalCents: number; shippingCents: number; totalCents: number; freeShipping: boolean };

const FIELDS = [
  { name: "firstName", label: "Nome", type: "text", autoComplete: "given-name", required: true },
  { name: "lastName", label: "Cognome", type: "text", autoComplete: "family-name", required: true },
  { name: "email", label: "Email", type: "email", autoComplete: "email", required: true, full: true },
  { name: "phone", label: "Telefono (facoltativo)", type: "tel", autoComplete: "tel", required: false, full: true },
  { name: "address1", label: "Indirizzo", type: "text", autoComplete: "address-line1", required: true, full: true },
  { name: "address2", label: "Scala, interno (facoltativo)", type: "text", autoComplete: "address-line2", required: false, full: true },
  { name: "zip", label: "CAP", type: "text", autoComplete: "postal-code", required: true },
  { name: "city", label: "Città", type: "text", autoComplete: "address-level2", required: true },
  { name: "province", label: "Provincia", type: "text", autoComplete: "address-level1", required: false },
  { name: "country", label: "Paese", type: "text", autoComplete: "country-name", required: true },
] as const;

export default function CheckoutForm({ paymentsLive, testMode, cancelled }: Props) {
  const { lines, ready, subtotalCents, clear } = useCart();
  const [zone, setZone] = useState("IT");
  const [totals, setTotals] = useState<Totals | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Il totale definitivo lo calcola il server: qui mostriamo solo l'anteprima.
  useEffect(() => {
    if (!ready || lines.length === 0) return;
    let cancelledFetch = false;
    (async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })), zone }),
        });
        const data = await res.json();
        if (!cancelledFetch && res.ok) setTotals(data);
      } catch {
        /* manteniamo l'ultimo totale conosciuto */
      }
    })();
    return () => {
      cancelledFetch = true;
    };
  }, [ready, lines, zone]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const customer = Object.fromEntries(FIELDS.map((f) => [f.name, String(form.get(f.name) ?? "").trim()]));
    customer.note = String(form.get("note") ?? "").trim();

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
          zone,
          customer,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error([data.error, ...(data.issues ?? [])].filter(Boolean).join(" ") || "Checkout non riuscito");
      }
      // Il carrello viene svuotato solo dopo che l'ordine esiste sul server.
      clear();
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout non riuscito");
      setSubmitting(false);
    }
  }

  if (!ready) return <p className="text-bone-dim">Carico il carrello…</p>;

  if (lines.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-ink-2 p-10 text-center">
        <p className="h-display text-2xl">Non c&apos;è niente da pagare</p>
        <p className="mt-2 text-bone-dim">Aggiungi almeno un&apos;esca al carrello.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-md bg-brass px-6 py-3 font-bold text-ink">
          Vai al catalogo
        </Link>
      </div>
    );
  }

  const shown = totals ?? {
    subtotalCents,
    shippingCents: subtotalCents >= site.shipping.freeThresholdCents ? 0 : site.shipping.zones[0].priceCents,
    totalCents: subtotalCents,
    freeShipping: subtotalCents >= site.shipping.freeThresholdCents,
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div>
        {cancelled && (
          <p className="mb-6 rounded-lg border border-rust/50 bg-rust/10 p-4 text-sm">
            Pagamento annullato. Nessun importo è stato addebitato: puoi riprovare quando vuoi.
          </p>
        )}

        {!paymentsLive && (
          <div className="mb-6 rounded-lg border border-brass/50 bg-brass/10 p-4 text-sm">
            <p className="font-bold text-brass">Modalità dimostrativa attiva</p>
            <p className="mt-1 text-bone-dim">
              Stripe non è ancora collegato: il pagamento verrà <strong>simulato</strong> e l&apos;ordine
              registrato come ordine di prova. Puoi provare tutto il percorso d&apos;acquisto senza spendere nulla.
            </p>
          </div>
        )}
        {paymentsLive && testMode && (
          <div className="mb-6 rounded-lg border border-brass/50 bg-brass/10 p-4 text-sm">
            <p className="font-bold text-brass">Stripe in modalità test</p>
            <p className="mt-1 text-bone-dim">
              Usa la carta di prova <code className="font-mono">4242 4242 4242 4242</code>, una data futura e un CVC qualsiasi.
            </p>
          </div>
        )}

        <fieldset>
          <legend className="h-display text-2xl">Dati di spedizione</legend>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.name} className={"full" in f && f.full ? "sm:col-span-2" : ""}>
                <label htmlFor={f.name} className="block text-sm font-medium">
                  {f.label} {f.required && <span className="text-brass">*</span>}
                </label>
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type}
                  required={f.required}
                  autoComplete={f.autoComplete}
                  defaultValue={f.name === "country" ? "Italia" : undefined}
                  className="mt-1.5 w-full rounded-md border border-line bg-ink-2 px-3 py-2.5 text-sm"
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <label htmlFor="zone" className="block text-sm font-medium">
                Destinazione <span className="text-brass">*</span>
              </label>
              <select
                id="zone"
                name="zone"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-line bg-ink-2 px-3 py-2.5 text-sm"
              >
                {site.shipping.zones.map((z) => (
                  <option key={z.code} value={z.code}>
                    {z.label} — {formatPrice(z.priceCents)} · {z.days}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="note" className="block text-sm font-medium">
                Note per la consegna (facoltativo)
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                className="mt-1.5 w-full rounded-md border border-line bg-ink-2 px-3 py-2.5 text-sm"
                placeholder="Citofono, orari, richieste particolari…"
              />
            </div>
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-lg border border-line bg-ink-2 p-6 lg:sticky lg:top-32">
        <h2 className="h-display text-xl">Il tuo ordine</h2>

        <ul className="mt-4 space-y-3">
          {lines.map((l) => (
            <li key={l.variantId} className="flex items-center gap-3">
              <div className="w-14 shrink-0 rounded border border-line bg-ink p-1">
                <LureArt palette={l.palette} kind={l.kind as never} uid={l.variantId} className="w-full" />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-semibold">{l.productName}</p>
                <p className="text-bone-dim">
                  {l.variantName} · ×{l.quantity}
                </p>
              </div>
              <p className="text-sm tabular-nums">{formatPrice(l.priceCents * l.quantity)}</p>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-bone-dim">Subtotale</dt>
            <dd className="tabular-nums">{formatPrice(shown.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-bone-dim">Spedizione</dt>
            <dd className="tabular-nums">{shown.freeShipping ? "Gratuita" : formatPrice(shown.shippingCents)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
            <dt>Totale</dt>
            <dd className="tabular-nums">{formatPrice(shown.totalCents)}</dd>
          </div>
        </dl>

        {error && (
          <p className="mt-4 rounded-md border border-rust/50 bg-rust/10 p-3 text-sm" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-md bg-brass px-6 py-3 font-bold text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Un attimo…" : paymentsLive ? "Paga con carta" : "Simula il pagamento"}
        </button>

        <p className="mt-3 text-center text-xs text-bone-dim">
          Proseguendo accetti i{" "}
          <Link href="/termini" className="underline">
            termini di vendita
          </Link>
          .
        </p>
      </aside>
    </form>
  );
}
