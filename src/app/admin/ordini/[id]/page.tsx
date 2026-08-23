import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS } from "@/lib/order-status";
import { updateOrder } from "../../actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dettaglio ordine" };

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/ordini" className="text-sm text-bone-dim hover:text-bone">
        ← Tutti gli ordini
      </Link>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="h-display text-3xl">Ordine {order.number}</h1>
        <p className={ORDER_STATUS[order.status]?.tone}>{ORDER_STATUS[order.status]?.label ?? order.status}</p>
      </div>
      <p className="mt-1 text-sm text-bone-dim">
        {formatDate(order.createdAt)}
        {order.paidAt ? ` · pagato il ${formatDate(order.paidAt)}` : ""} · pagamento{" "}
        {order.paymentProvider === "demo" ? "simulato (prova)" : "Stripe"}
        {order.paymentRef ? ` · rif. ${order.paymentRef}` : ""}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="eyebrow">Articoli</h2>
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
              <dt className="text-bone-dim">Spedizione ({order.shippingZone})</dt>
              <dd className="tabular-nums">{formatPrice(order.shippingCents)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-bold">
              <dt>Totale</dt>
              <dd className="tabular-nums">{formatPrice(order.totalCents)}</dd>
            </div>
          </dl>

          <h2 className="eyebrow mt-8">Spedizione</h2>
          <address className="mt-2 rounded-lg border border-line p-4 not-italic text-sm leading-relaxed text-bone-dim">
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
            <br />
            <a href={`mailto:${order.email}`} className="text-brass underline">
              {order.email}
            </a>
            {order.phone && <> · {order.phone}</>}
          </address>

          {order.note && (
            <>
              <h2 className="eyebrow mt-6">Nota del cliente</h2>
              <p className="mt-2 rounded-lg border border-line p-4 text-sm text-bone-dim">{order.note}</p>
            </>
          )}
        </div>

        <aside className="h-fit rounded-lg border border-line bg-ink-2 p-5">
          <h2 className="h-display text-lg">Aggiorna l&apos;ordine</h2>
          <form action={updateOrder} className="mt-4 space-y-4">
            <input type="hidden" name="id" value={order.id} />
            <div>
              <label htmlFor="status" className="block text-sm font-medium">
                Stato
              </label>
              <select
                id="status"
                name="status"
                defaultValue={order.status}
                className="mt-1.5 w-full rounded-md border border-line bg-ink px-3 py-2.5 text-sm"
              >
                {Object.entries(ORDER_STATUS).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="trackingCode" className="block text-sm font-medium">
                Codice di tracciamento
              </label>
              <input
                id="trackingCode"
                name="trackingCode"
                defaultValue={order.trackingCode}
                className="mt-1.5 w-full rounded-md border border-line bg-ink px-3 py-2.5 text-sm"
              />
            </div>
            <button type="submit" className="w-full rounded-md bg-brass px-4 py-2.5 font-bold text-ink">
              Salva
            </button>
          </form>

          <p className="mt-5 border-t border-line pt-4 text-xs text-bone-dim">
            Pagina che vede il cliente:{" "}
            <Link href={`/ordine/${order.number}?token=${order.publicToken}`} className="text-brass underline">
              apri
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
