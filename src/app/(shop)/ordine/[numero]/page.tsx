import type { Metadata } from "next";
import Link from "next/link";
import { getOrderByNumber } from "@/lib/orders";
import { ORDER_STATUS } from "@/lib/order-status";
import { formatDate, formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { isPaymentsLive } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Il tuo ordine", robots: { index: false, follow: false } };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ numero: string }>;
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { numero } = await params;
  const { token, email } = await searchParams;

  const order = await getOrderByNumber(decodeURIComponent(numero).toUpperCase());

  // L'ordine si apre col token ricevuto via email oppure indicando l'email dell'ordine.
  const authorized =
    !!order &&
    ((token && token === order.publicToken) ||
      (email && email.trim().toLowerCase() === order.email.toLowerCase()));

  if (!order || !authorized) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="h-display text-3xl">Ordine non trovato</h1>
        <p className="mt-3 text-bone-dim">
          Controlla il numero d&apos;ordine e l&apos;email usata per l&apos;acquisto. Il link completo si trova
          nell&apos;email di conferma.
        </p>
        <Link href="/ordine" className="mt-8 inline-block rounded-md bg-brass px-6 py-3 font-bold text-ink">
          Riprova
        </Link>
      </div>
    );
  }

  const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending;
  const isDemo = order.paymentProvider === "demo";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      {order.status === "paid" && (
        <div className="mb-8 rounded-lg border border-brass/50 bg-brass/10 p-6">
          <p className="eyebrow">Grazie!</p>
          <h1 className="h-display mt-2 text-3xl">Ordine confermato</h1>
          <p className="mt-2 text-bone-dim">
            Ti abbiamo mandato una conferma a <strong className="text-bone">{order.email}</strong>.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="h-display text-2xl">Ordine {order.number}</h2>
        <p className={`font-semibold ${status.tone}`}>{status.label}</p>
      </div>
      <p className="mt-1 text-sm text-bone-dim">
        Effettuato il {formatDate(order.createdAt)} · {status.hint}
      </p>

      {isDemo && !isPaymentsLive() && (
        <p className="mt-4 rounded-md border border-brass/40 bg-brass/5 p-3 text-sm text-bone-dim">
          Ordine di <strong className="text-brass">prova</strong>: nessun pagamento reale è stato incassato.
        </p>
      )}

      {order.trackingCode && (
        <p className="mt-4 rounded-md border border-line p-3 text-sm">
          Codice di tracciamento: <strong className="font-mono">{order.trackingCode}</strong>
        </p>
      )}

      <section className="mt-8">
        <h3 className="eyebrow">Articoli</h3>
        <ul className="mt-3 divide-y divide-line rounded-lg border border-line">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-semibold">{i.productName}</p>
                <p className="text-sm text-bone-dim">
                  {i.variantName} · SKU {i.sku} · ×{i.quantity}
                </p>
              </div>
              <p className="tabular-nums">{formatPrice(i.unitPriceCents * i.quantity)}</p>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-bone-dim">Subtotale</dt>
            <dd className="tabular-nums">{formatPrice(order.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-bone-dim">Spedizione</dt>
            <dd className="tabular-nums">
              {order.shippingCents === 0 ? "Gratuita" : formatPrice(order.shippingCents)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-bold">
            <dt>Totale</dt>
            <dd className="tabular-nums">{formatPrice(order.totalCents)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-line p-4">
          <h3 className="eyebrow">Spedizione</h3>
          <address className="mt-2 not-italic text-sm leading-relaxed text-bone-dim">
            {order.firstName} {order.lastName}
            <br />
            {order.address1}
            {order.address2 && (
              <>
                <br />
                {order.address2}
              </>
            )}
            <br />
            {order.zip} {order.city} {order.province && `(${order.province})`}
            <br />
            {order.country}
            {order.phone && (
              <>
                <br />
                Tel. {order.phone}
              </>
            )}
          </address>
        </div>
        <div className="rounded-lg border border-line p-4">
          <h3 className="eyebrow">Assistenza</h3>
          <p className="mt-2 text-sm text-bone-dim">
            Qualcosa non torna? Scrivici a{" "}
            <a href={`mailto:${site.email}`} className="text-brass underline">
              {site.email}
            </a>{" "}
            citando il numero <strong className="text-bone">{order.number}</strong>.
          </p>
          {order.note && <p className="mt-3 text-sm text-bone-dim">Nota: “{order.note}”</p>}
        </div>
      </section>

      <div className="mt-10 text-center">
        <Link href="/shop" className="rounded-md border border-line px-6 py-3 font-semibold hover:border-brass hover:text-brass">
          Continua a esplorare il catalogo
        </Link>
      </div>
    </div>
  );
}
