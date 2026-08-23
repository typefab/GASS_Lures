import Link from "next/link";
import { and, desc, eq, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages, newsletter, orders, products, variants } from "@/lib/db/schema";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS } from "@/lib/order-status";
import { isPaymentsLive } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [[revenue], [paidCount], [pendingCount], [productCount], [messageCount], [newsletterCount]] =
    await Promise.all([
      db
        .select({ total: sql<number>`coalesce(sum(${orders.totalCents}), 0)` })
        .from(orders)
        .where(sql`${orders.status} in ('paid','shipped','delivered')`),
      db
        .select({ n: sql<number>`count(*)` })
        .from(orders)
        .where(sql`${orders.status} in ('paid','shipped','delivered')`),
      db.select({ n: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending")),
      db.select({ n: sql<number>`count(*)` }).from(products).where(eq(products.active, true)),
      db.select({ n: sql<number>`count(*)` }).from(messages).where(eq(messages.handled, false)),
      db.select({ n: sql<number>`count(*)` }).from(newsletter),
    ]);

  const recent = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6);

  const lowStock = await db
    .select({ variant: variants, product: products })
    .from(variants)
    .innerJoin(products, eq(variants.productId, products.id))
    .where(and(eq(variants.active, true), lte(variants.stock, 3)))
    .orderBy(variants.stock)
    .limit(8);

  const stats = [
    { label: "Incassato", value: formatPrice(Number(revenue.total ?? 0)), href: "/admin/ordini" },
    { label: "Ordini pagati", value: String(paidCount.n ?? 0), href: "/admin/ordini" },
    { label: "In attesa di pagamento", value: String(pendingCount.n ?? 0), href: "/admin/ordini" },
    { label: "Prodotti attivi", value: String(productCount.n ?? 0), href: "/admin/prodotti" },
    { label: "Messaggi da leggere", value: String(messageCount.n ?? 0), href: "/admin/messaggi" },
    { label: "Iscritti newsletter", value: String(newsletterCount.n ?? 0), href: "/admin/newsletter" },
  ];

  return (
    <div>
      <h1 className="h-display text-3xl">Riepilogo</h1>

      {!isPaymentsLive() && (
        <p className="mt-4 rounded-lg border border-brass/50 bg-brass/10 p-4 text-sm">
          <strong className="text-brass">Modalità dimostrativa.</strong> Gli ordini vengono registrati ma nessun
          pagamento viene incassato davvero. Per attivare gli incassi imposta le variabili{" "}
          <code className="font-mono">STRIPE_SECRET_KEY</code> e{" "}
          <code className="font-mono">STRIPE_WEBHOOK_SECRET</code>.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-lg border border-line bg-ink-2 p-5 hover:border-brass/60">
            <p className="eyebrow">{s.label}</p>
            <p className="font-display mt-2 text-3xl font-semibold tabular-nums">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="h-display text-xl">Ultimi ordini</h2>
            <Link href="/admin/ordini" className="text-sm text-brass hover:underline">
              Vedi tutti
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-3 rounded-lg border border-line p-6 text-sm text-bone-dim">
              Ancora nessun ordine. Fai un acquisto di prova dal sito per collaudare il percorso completo.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-lg border border-line">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/ordini/${o.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-ink-2">
                    <div className="min-w-0">
                      <p className="font-mono text-sm">{o.number}</p>
                      <p className="truncate text-xs text-bone-dim">
                        {o.firstName} {o.lastName} · {formatDate(o.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="tabular-nums">{formatPrice(o.totalCents)}</p>
                      <p className={`text-xs ${ORDER_STATUS[o.status]?.tone ?? ""}`}>
                        {ORDER_STATUS[o.status]?.label ?? o.status}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="h-display text-xl">Scorte in esaurimento</h2>
          {lowStock.length === 0 ? (
            <p className="mt-3 rounded-lg border border-line p-6 text-sm text-bone-dim">
              Nessuna colorazione sotto i 3 pezzi. Tutto in ordine.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-lg border border-line">
              {lowStock.map(({ variant, product }) => (
                <li key={variant.id}>
                  <Link
                    href={`/admin/prodotti/${product.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-ink-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{product.name}</p>
                      <p className="truncate text-xs text-bone-dim">{variant.name}</p>
                    </div>
                    <span className={`shrink-0 text-sm font-bold ${variant.stock === 0 ? "text-rust" : "text-brass"}`}>
                      {variant.stock === 0 ? "esaurito" : `${variant.stock} pz`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
