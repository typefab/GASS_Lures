import Link from "next/link";
import Logo from "./Logo";
import NewsletterForm from "./NewsletterForm";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/format";

const SHOP_LINKS = [
  { href: "/shop", label: "Tutti i prodotti" },
  { href: "/shop?categoria=minnow", label: "Minnow" },
  { href: "/shop?categoria=stickbait", label: "Stickbait" },
  { href: "/shop?categoria=micro", label: "Micro esche" },
  { href: "/shop?categoria=accessori", label: "Accessori" },
];

const INFO_LINKS = [
  { href: "/chi-siamo", label: "La nostra storia" },
  { href: "/spedizioni-e-resi", label: "Spedizioni e resi" },
  { href: "/contatti", label: "Contatti" },
  { href: "/ordine", label: "Traccia il tuo ordine" },
  { href: "/termini", label: "Termini e condizioni" },
  { href: "/privacy", label: "Privacy e cookie" },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-ink-2">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="text-brass">
            <Logo />
          </span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-bone-dim">{site.description}</p>
          <div className="mt-5 flex gap-3">
            {site.social.instagram && (
              <a href={site.social.instagram} className="text-bone-dim hover:text-brass" aria-label="Instagram" target="_blank" rel="noreferrer noopener">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            )}
            {site.social.facebook && (
              <a href={site.social.facebook} className="text-bone-dim hover:text-brass" aria-label="Facebook" target="_blank" rel="noreferrer noopener">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.7v8h3.5z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        <nav aria-labelledby="footer-shop">
          <h2 id="footer-shop" className="eyebrow">Shop</h2>
          <ul className="mt-4 space-y-2.5">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-bone-dim hover:text-bone">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-info">
          <h2 id="footer-info" className="eyebrow">Informazioni</h2>
          <ul className="mt-4 space-y-2.5">
            {INFO_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-bone-dim hover:text-bone">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow">Resta aggiornato</h2>
          <p className="mt-4 text-sm text-bone-dim">
            Nuove colorazioni, serie limitate e consigli dal laboratorio. Niente spam.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-bone-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name} · P.IVA {site.vat} · Spedizione gratuita sopra{" "}
            {formatPrice(site.shipping.freeThresholdCents)}
          </p>
          <p className="flex items-center gap-2">
            <span>Pagamenti sicuri</span>
            <span className="rounded border border-line px-2 py-1 font-semibold">VISA</span>
            <span className="rounded border border-line px-2 py-1 font-semibold">Mastercard</span>
            <span className="rounded border border-line px-2 py-1 font-semibold">Apple&nbsp;Pay</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
