"use client";

import Link from "next/link";
import { useCallback, useEffect, useSyncExternalStore } from "react";

/**
 * Informativa privacy mostrata alla prima visita.
 *
 * Il sito non usa cookie di profilazione né strumenti di tracciamento: non c'è
 * quindi nulla da "accettare o rifiutare", e offrire una scelta finta sarebbe
 * scorretto. Questo è un avviso informativo, che si chiude con presa visione.
 * Se un domani aggiungiamo statistiche o pixel pubblicitari, qui servirà un
 * vero banner di consenso con scelte granulari.
 */

const KEY = "gass_privacy_ack_v1";
const listeners = new Set<() => void>();

// Usato quando il browser blocca lo storage: la chiusura vale per la sessione.
let memoryAck = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(KEY) === "1" || memoryAck;
  } catch {
    return memoryAck;
  }
}

/** Sul server non sappiamo cosa ha già visto l'utente: non mostriamo nulla. */
function getServerSnapshot() {
  return true;
}

export default function PrivacyNotice() {
  const acknowledged = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const acknowledge = useCallback(() => {
    memoryAck = true;
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* storage non disponibile: resta valido per questa sessione */
    }
    for (const listener of listeners) listener();
  }, []);

  // Esc chiude l'avviso, come ci si aspetta da qualunque riquadro sovrapposto.
  useEffect(() => {
    if (acknowledged) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") acknowledge();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [acknowledged, acknowledge]);

  if (acknowledged) return null;

  return (
    /* `pointer-events-none` sul contenitore, `auto` sul riquadro: la fascia
       trasparente non deve rubare i click ai pulsanti della pagina sotto. */
    <div
      role="region"
      aria-labelledby="privacy-notice-title"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-lg border border-line bg-ink-2 p-4 shadow-2xl sm:p-6">
        <h2 id="privacy-notice-title" className="h-display text-lg">
          Privacy e cookie
        </h2>

        <p className="mt-2 text-sm leading-snug text-bone-dim">
          <strong className="text-bone">Nessun cookie di profilazione</strong> né tracciamento
          pubblicitario: nel browser salviamo solo ciò che serve a far funzionare il sito, come il
          carrello. I dati di ordini e messaggi li usiamo soltanto per spedirti il pacco o
          risponderti.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={acknowledge}
            autoFocus
            className="rounded-md bg-brass px-5 py-2.5 font-bold text-ink transition-opacity hover:opacity-90"
          >
            Ho capito
          </button>
          <Link
            href="/privacy"
            onClick={acknowledge}
            className="text-sm text-bone-dim underline hover:text-bone"
          >
            Leggi l&apos;informativa completa
          </Link>
        </div>
      </div>
    </div>
  );
}
