import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/admin-session";
import { isPaymentsLive, isStripeTestMode } from "@/lib/stripe";
import { logout } from "./actions";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: "Gestione", template: `%s · Gestione ${site.name}` },
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Riepilogo" },
  { href: "/admin/ordini", label: "Ordini" },
  { href: "/admin/prodotti", label: "Prodotti" },
  { href: "/admin/messaggi", label: "Messaggi" },
  { href: "/admin/newsletter", label: "Newsletter" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const logged = await isAdmin();

  if (!logged) return <main className="min-h-dvh">{children}</main>;

  const paymentsLabel = !isPaymentsLive()
    ? { text: "Pagamenti: modalità dimostrativa", tone: "border-brass/50 bg-brass/10 text-brass" }
    : isStripeTestMode()
      ? { text: "Pagamenti: Stripe in test", tone: "border-brass/50 bg-brass/10 text-brass" }
      : { text: "Pagamenti: Stripe live", tone: "border-moss bg-moss/20 text-bone" };

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-ink-2">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
          <Link href="/admin" className="h-display text-lg text-brass">
            {site.name} · gestione
          </Link>
          <nav className="flex flex-wrap gap-4" aria-label="Navigazione gestione">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-sm text-bone-dim hover:text-bone">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${paymentsLabel.tone}`}>
              {paymentsLabel.text}
            </span>
            <Link href="/" className="text-sm text-bone-dim hover:text-bone">
              Vedi il sito
            </Link>
            <form action={logout}>
              <button type="submit" className="text-sm text-bone-dim underline hover:text-rust">
                Esci
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
