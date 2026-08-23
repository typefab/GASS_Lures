import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db } from "./db";
import { products, variants } from "./db/schema";
import { shippingZone, site } from "./site";

export type CartInput = { variantId: string; quantity: number };

export type PricedLine = {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  stock: number;
};

export type PricedCart = {
  lines: PricedLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  freeShipping: boolean;
  /** Correzioni applicate rispetto a quanto inviato dal client (stock esaurito, prezzi cambiati…). */
  issues: string[];
};

/**
 * Ricalcola il carrello a partire dai dati nel database.
 * Il client può inviare qualunque prezzo: qui viene sempre ignorato.
 */
export async function priceCart(input: CartInput[], zoneCode = "IT"): Promise<PricedCart> {
  const issues: string[] = [];

  const wanted = new Map<string, number>();
  for (const item of input) {
    if (!item || typeof item.variantId !== "string") continue;
    const qty = Math.floor(Number(item.quantity));
    if (!Number.isFinite(qty) || qty <= 0) continue;
    wanted.set(item.variantId, Math.min(99, (wanted.get(item.variantId) ?? 0) + qty));
  }

  if (wanted.size === 0) {
    return emptyCart(zoneCode, issues);
  }

  const rows = await db
    .select({ variant: variants, product: products })
    .from(variants)
    .innerJoin(products, eq(variants.productId, products.id))
    .where(inArray(variants.id, [...wanted.keys()]));

  const lines: PricedLine[] = [];

  for (const [variantId, requested] of wanted) {
    const row = rows.find((r) => r.variant.id === variantId);
    if (!row || !row.variant.active || !row.product.active) {
      issues.push("Un articolo non è più disponibile ed è stato rimosso dal carrello.");
      continue;
    }
    const available = Math.max(0, row.variant.stock);
    if (available === 0) {
      issues.push(`${row.product.name} — ${row.variant.name}: esaurito, rimosso dal carrello.`);
      continue;
    }
    const quantity = Math.min(requested, available);
    if (quantity < requested) {
      issues.push(
        `${row.product.name} — ${row.variant.name}: disponibili solo ${available} pezzi, quantità aggiornata.`,
      );
    }
    const unitPriceCents = row.product.priceCents + row.variant.priceDeltaCents;
    lines.push({
      variantId,
      productId: row.product.id,
      productSlug: row.product.slug,
      productName: row.product.name,
      variantName: row.variant.name,
      sku: row.variant.sku,
      unitPriceCents,
      quantity,
      lineTotalCents: unitPriceCents * quantity,
      stock: available,
    });
  }

  if (lines.length === 0) return emptyCart(zoneCode, issues);

  const subtotalCents = lines.reduce((n, l) => n + l.lineTotalCents, 0);
  const zone = shippingZone(zoneCode);
  const freeShipping = subtotalCents >= site.shipping.freeThresholdCents;
  const shippingCents = freeShipping ? 0 : zone.priceCents;

  return {
    lines,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    currency: site.currency,
    freeShipping,
    issues,
  };
}

function emptyCart(zoneCode: string, issues: string[]): PricedCart {
  return {
    lines: [],
    subtotalCents: 0,
    shippingCents: 0,
    totalCents: 0,
    currency: site.currency,
    freeShipping: false,
    issues,
  };
}

/** Scala le giacenze dopo un pagamento andato a buon fine. */
export async function decrementStock(lines: { variantId: string | null; quantity: number }[]) {
  for (const line of lines) {
    if (!line.variantId) continue;
    const [v] = await db.select().from(variants).where(eq(variants.id, line.variantId)).limit(1);
    if (!v) continue;
    await db
      .update(variants)
      .set({ stock: Math.max(0, v.stock - line.quantity) })
      .where(eq(variants.id, line.variantId));
  }
}
