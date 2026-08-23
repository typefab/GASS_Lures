import Link from "next/link";
import { listOrders } from "@/lib/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ordini" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ stato?: string }>;
}) {
  const sp = await searchParams;
  const all = await listOrders(300);
  const rows = sp.stato ? all.filter((o) => o.status === sp.stato) : all;

  return (
    <div>
      <h1 className="h-display text-3xl">Ordini</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        <Filter href="/admin/ordini" active={!sp.stato}>
          Tutti ({all.length})
        </Filter>
        {Object.entries(ORDER_STATUS).map(([key, meta]) => {
          const n = all.filter((o) => o.status === key).length;
          if (n === 0) return null;
          return (
            <Filter key={key} href={`/admin/ordini?stato=${key}`} active={sp.stato === key}>
              {meta.label} ({n})
            </Filter>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-lg border border-line p-8 text-sm text-bone-dim">Nessun ordine da mostrare.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-ink-2 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Numero</th>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Stato</th>
                <th className="px-4 py-3 text-right font-semibold">Totale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((o) => (
                <tr key={o.id} className="hover:bg-ink-2">
                  <td className="px-4 py-3">
                    <Link href={`/admin/ordini/${o.id}`} className="font-mono text-brass hover:underline">
                      {o.number}
                    </Link>
                    {o.paymentProvider === "demo" && (
                      <span className="ml-2 rounded bg-ink-3 px-1.5 py-0.5 text-[10px] uppercase text-bone-dim">
                        prova
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-bone-dim">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    {o.firstName} {o.lastName}
                    <span className="block text-xs text-bone-dim">{o.email}</span>
                  </td>
                  <td className={`px-4 py-3 ${ORDER_STATUS[o.status]?.tone ?? ""}`}>
                    {ORDER_STATUS[o.status]?.label ?? o.status}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPrice(o.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Filter({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3.5 py-1.5 text-sm ${
        active ? "border-brass bg-brass font-semibold text-ink" : "border-line text-bone-dim hover:text-bone"
      }`}
    >
      {children}
    </Link>
  );
}
