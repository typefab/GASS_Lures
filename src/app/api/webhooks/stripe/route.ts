import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook Stripe: è qui che un ordine diventa "pagato".
 * Non fidarti mai del solo redirect di successo del browser.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook non configurato" }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Firma mancante" }, { status: 400 });

  const payload = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error("[stripe] firma non valida:", err);
    return NextResponse.json({ error: "Firma non valida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId ?? session.client_reference_id;
    if (orderId) {
      const result = await markOrderPaid(orderId, session.id, "stripe");
      if (!result.ok) console.error("[stripe] ordine non trovato:", orderId);
    }
  }

  return NextResponse.json({ received: true });
}
