"use client";

import Link from "next/link";
import { useState } from "react";
import CartCount from "./CartCount";
import Logo from "./Logo";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/format";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?categoria=minnow", label: "Esche" },
  { href: "/shop?categoria=accessori", label: "Accessori" },
  { href: "/shop?categoria=merch", label: "Abbigliamento" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/contatti", label: "Contatti" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/90 backdrop-blur">
      <div className="bg-brass text-ink">
        <p className="mx-auto max-w-7xl px-4 py-1.5 text-center text-[12px] font-semibold tracking-wide">
          Spedizione gratuita in Italia sopra {formatPrice(site.shipping.freeThresholdCents)} · Costruite a mano, una alla volta
        </p>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3.5">
        <Link href="/" className="shrink-0 text-brass" aria-label={`${site.name} — home`}>
          <Logo />
        </Link>

        <nav className="ml-auto hidden items-center gap-6 lg:flex" aria-label="Navigazione principale">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-bone-dim transition-colors hover:text-bone"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/carrello"
          className="relative ml-auto flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold transition-colors hover:border-brass hover:text-brass lg:ml-0"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="20" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
          </svg>
          <span className="hidden sm:inline">Carrello</span>
          <CartCount />
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-line p-2 lg:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Chiudi il menu" : "Apri il menu"}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="menu-mobile" className="border-t border-line lg:hidden" aria-label="Navigazione mobile">
          <ul className="mx-auto max-w-7xl px-4 py-2">
            {NAV.map((item) => (
              <li key={item.label} className="border-b border-line/60 last:border-0">
                <Link href={item.href} onClick={() => setOpen(false)} className="block py-3 text-sm font-medium">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
