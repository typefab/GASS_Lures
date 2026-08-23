import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DemoPayment from "@/components/DemoPayment";
import { getOrderById } from "@/lib/orders";
import { isPaymentsLive } from "@/lib/stripe";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pagamento di prova",
  robots: { index: false, follow: false },
};

/**
 * Finto gateway di pagamento, usato solo quando Stripe non è configurato.
 * Riproduce il percorso reale (successo / rifiuto) così puoi collaudare il negozio.
 */
export default async function DemoCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  if (isPaymentsLive()) redirect("/checkout");

  const { orderId } = await params;
  const { token } = await searchParams;

  const order = await getOrderById(orderId);
  if (!order || !token || order.publicToken !== token) notFound();

  if (order.status !== "pending") {
    redirect(`/ordine/${order.number}?token=${order.publicToken}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-xl border border-brass/50 bg-ink-2 p-8">
        <p className="eyebrow">Ambiente di prova</p>
        <h1 className="h-display mt-2 text-3xl">Pagamento simulato</h1>
        <p className="mt-3 text-bone-dim">
          Questo non è un pagamento reale: nessuna carta viene addebitata. Serve a collaudare l&apos;intero
          percorso d&apos;acquisto finché non colleghiamo Stripe.
        </p>

        <dl className="mt-6 divide-y divide-line rounded-lg border border-line">
          <Row label="Ordine" value={order.number} />
          <Row label="Intestatario" value={`${order.firstName} ${order.lastName}`} />
          <Row label="Email" value={order.email} />
          <Row label="Articoli" value={String(order.items.reduce((n, i) => n + i.quantity, 0))} />
          <Row label="Spedizione" value={order.shippingCents === 0 ? "Gratuita" : formatPrice(order.shippingCents)} />
          <Row label="Totale" value={formatPrice(order.totalCents)} strong />
        </dl>

        <div className="mt-7">
          <DemoPayment orderId={order.id} token={order.publicToken} />
        </div>

        <p className="mt-6 text-center text-xs text-bone-dim">
          <Link href="/carrello" className="underline">
            Torna al carrello
          </Link>
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-3 text-sm">
      <dt className="text-bone-dim">{label}</dt>
      <dd className={strong ? "font-bold" : "font-semibold"}>{value}</dd>
    </div>
  );
}
