import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { getOrderById, markOrderPaid } from "@/lib/orders";
import { isPaymentsLive } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  orderId: z.string().min(1),
  token: z.string().min(1),
  outcome: z.enum(["success", "failure"]),
});

/**
 * Conferma (o rifiuta) un pagamento simulato.
 * Attiva solo quando Stripe NON è configurato: appena inserisci le chiavi
 * questa rotta smette di funzionare e i pagamenti passano tutti da Stripe.
 */
export async function POST(request: Request) {
  if (isPaymentsLive()) {
    return NextResponse.json(
      { error: "I pagamenti reali sono attivi: il checkout di prova è disabilitato." },
      { status: 403 },
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });

  const { orderId, token, outcome } = parsed.data;
  const order = await getOrderById(orderId);
  if (!order || order.publicToken !== token) {
    return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 });
  }

  if (outcome === "failure") {
    if (order.status === "pending") {
      await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, orderId));
    }
    return NextResponse.json({ status: "cancelled", redirect: "/checkout?annullato=1" });
  }

  await markOrderPaid(orderId, `demo_${Date.now()}`, "demo");
  return NextResponse.json({
    status: "paid",
    redirect: `/ordine/${order.number}?token=${order.publicToken}`,
  });
}
