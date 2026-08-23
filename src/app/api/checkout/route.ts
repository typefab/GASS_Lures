import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { priceCart } from "@/lib/cart-server";
import { newId, newOrderNumber, newToken } from "@/lib/id";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  items: z.array(z.object({ variantId: z.string().min(1), quantity: z.number().int().positive() })).min(1).max(50),
  zone: z.enum(["IT", "EU", "WORLD"]).default("IT"),
  customer: z.object({
    email: z.email(),
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    phone: z.string().max(40).optional().default(""),
    address1: z.string().min(3).max(160),
    address2: z.string().max(160).optional().default(""),
    city: z.string().min(1).max(80),
    zip: z.string().min(3).max(16),
    province: z.string().max(80).optional().default(""),
    country: z.string().min(2).max(60).default("Italia"),
    note: z.string().max(1000).optional().default(""),
  }),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati di spedizione incompleti o non validi." }, { status: 400 });
  }

  const { items, zone, customer } = parsed.data;

  // I prezzi arrivano sempre dal database, mai dal browser.
  const cart = await priceCart(items, zone);
  if (cart.lines.length === 0) {
    return NextResponse.json(
      { error: "Il carrello è vuoto o gli articoli non sono più disponibili.", issues: cart.issues },
      { status: 409 },
    );
  }
  if (cart.issues.length > 0) {
    return NextResponse.json(
      { error: "Alcuni articoli sono cambiati: controlla il carrello prima di pagare.", issues: cart.issues },
      { status: 409 },
    );
  }

  const orderId = newId("ord");
  const number = newOrderNumber();
  const publicToken = newToken();

  await db.insert(orders).values({
    id: orderId,
    number,
    status: "pending",
    email: customer.email.trim().toLowerCase(),
    firstName: customer.firstName.trim(),
    lastName: customer.lastName.trim(),
    phone: customer.phone ?? "",
    address1: customer.address1.trim(),
    address2: customer.address2 ?? "",
    city: customer.city.trim(),
    zip: customer.zip.trim(),
    province: customer.province ?? "",
    country: customer.country || "Italia",
    shippingZone: zone,
    note: customer.note ?? "",
    subtotalCents: cart.subtotalCents,
    shippingCents: cart.shippingCents,
    totalCents: cart.totalCents,
    currency: cart.currency,
    paymentProvider: "demo",
    publicToken,
  });

  for (const line of cart.lines) {
    await db.insert(orderItems).values({
      id: newId("oit"),
      orderId,
      variantId: line.variantId,
      productSlug: line.productSlug,
      productName: line.productName,
      variantName: line.variantName,
      sku: line.sku,
      unitPriceCents: line.unitPriceCents,
      quantity: line.quantity,
    });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const successUrl = `${base}/ordine/${number}?token=${publicToken}`;
  const stripe = getStripe();

  // ---- Modalità dimostrativa: nessuna chiave Stripe configurata ----------
  if (!stripe) {
    return NextResponse.json({
      mode: "demo",
      orderNumber: number,
      url: `${base}/checkout/demo/${orderId}?token=${publicToken}`,
    });
  }

  // ---- Pagamento reale tramite Stripe Checkout ---------------------------
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "it",
      customer_email: customer.email,
      client_reference_id: orderId,
      metadata: { orderId, orderNumber: number },
      line_items: cart.lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: cart.currency.toLowerCase(),
          unit_amount: l.unitPriceCents,
          product_data: {
            name: `${l.productName} — ${l.variantName}`,
            metadata: { sku: l.sku },
          },
        },
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: cart.freeShipping ? "Spedizione gratuita" : `Spedizione ${zone}`,
            fixed_amount: { amount: cart.shippingCents, currency: cart.currency.toLowerCase() },
          },
        },
      ],
      success_url: successUrl,
      cancel_url: `${base}/checkout?annullato=1`,
    });

    await db
      .update(orders)
      .set({ paymentProvider: "stripe", paymentRef: session.id })
      .where(eq(orders.id, orderId));

    return NextResponse.json({ mode: "stripe", orderNumber: number, url: session.url });
  } catch (err) {
    console.error("[checkout] Stripe ha rifiutato la sessione:", err);
    return NextResponse.json(
      { error: "Non riusciamo ad aprire il pagamento. Riprova fra poco o scrivici." },
      { status: 502 },
    );
  }
}
