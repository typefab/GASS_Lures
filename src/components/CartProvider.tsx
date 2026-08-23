"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

export type CartLine = {
  variantId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  priceCents: number;
  palette: string;
  kind: string;
  quantity: number;
  maxQuantity: number;
};

type CartState = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  subtotalCents: number;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  lastAdded: string | null;
};

const STORAGE_KEY = "gass_cart_v1";

/* ---------------------------------------------------------------------------
 * Il carrello vive in localStorage: è uno store esterno a React, quindi lo
 * leggiamo con useSyncExternalStore. Così l'HTML del server e la prima
 * renderizzazione del browser coincidono e non c'è nessun "salto" all'avvio.
 * ------------------------------------------------------------------------- */

const EMPTY: CartLine[] = [];
let snapshot: CartLine[] = EMPTY;
let snapshotRaw: string | null = null;
const listeners = new Set<() => void>();

function parse(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(
      (l): l is CartLine =>
        !!l && typeof l.variantId === "string" && typeof l.quantity === "number" && l.quantity > 0,
    );
  } catch {
    return EMPTY;
  }
}

/** Ritorna sempre lo stesso array finché il contenuto salvato non cambia. */
function getSnapshot(): CartLine[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== snapshotRaw) {
    snapshotRaw = raw;
    snapshot = parse(raw);
  }
  return snapshot;
}

/** Sul server non esiste alcun carrello salvato. */
function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    // Tiene allineate più schede aperte sullo stesso carrello.
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(next: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage pieno o disabilitato: teniamo comunque lo stato in memoria
    snapshotRaw = null;
    snapshot = next;
  }
  for (const l of listeners) l();
}

function current(): CartLine[] {
  return typeof window === "undefined" ? EMPTY : getSnapshot();
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const add = useCallback<CartState["add"]>((line, quantity = 1) => {
    const next = [...current()];
    const i = next.findIndex((l) => l.variantId === line.variantId);
    const cap = Math.max(1, line.maxQuantity);
    if (i >= 0) {
      next[i] = { ...next[i], ...line, quantity: Math.min(cap, next[i].quantity + quantity) };
    } else {
      next.push({ ...line, quantity: Math.min(cap, quantity) });
    }
    write(next);
    setLastAdded(line.variantId);
    window.setTimeout(() => setLastAdded((v) => (v === line.variantId ? null : v)), 2500);
  }, []);

  const setQuantity = useCallback<CartState["setQuantity"]>((variantId, quantity) => {
    write(
      current()
        .map((l) =>
          l.variantId === variantId
            ? { ...l, quantity: Math.max(0, Math.min(l.maxQuantity || 99, quantity)) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const remove = useCallback<CartState["remove"]>((variantId) => {
    write(current().filter((l) => l.variantId !== variantId));
  }, []);

  const clear = useCallback(() => write([]), []);

  const value = useMemo<CartState>(() => {
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const subtotalCents = lines.reduce((n, l) => n + l.priceCents * l.quantity, 0);
    return { lines, ready, count, subtotalCents, add, setQuantity, remove, clear, lastAdded };
  }, [lines, ready, add, setQuantity, remove, clear, lastAdded]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve essere usato dentro <CartProvider>");
  return ctx;
}
