import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { orderItems, orders } from "./db/schema";
import { decrementStock } from "./cart-server";
import { sendEmail } from "./email";
import { site } from "./site";
import { formatPrice } from "./format";

export async function getOrderByNumber(number: string) {
  const [order] = await db.select().from(orders).where(eq(orders.number, number)).limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { ...order, items };
}

export async function getOrderById(id: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { ...order, items };
}

export async function listOrders(limit = 100) {
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
}

/**
 * Segna un ordine come pagato: scala le giacenze e invia le email.
 * È idempotente — richiamarla su un ordine già pagato non fa nulla.
 */
export async function markOrderPaid(orderId: string, paymentRef: string, provider: "stripe" | "demo") {
  const order = await getOrderById(orderId);
  if (!order) return { ok: false as const, reason: "not_found" as const };
  if (order.status !== "pending") return { ok: true as const, alreadyPaid: true as const };

  await db
    .update(orders)
    .set({
      status: "paid",
      paymentRef,
      paymentProvider: provider,
      paidAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(orders.id, orderId));

  await decrementStock(order.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));

  const righe = order.items
    .map((i) => `· ${i.quantity} × ${i.productName} (${i.variantName}) — ${formatPrice(i.unitPriceCents * i.quantity)}`)
    .join("\n");

  const trackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/ordine/${order.number}?token=${order.publicToken}`;

  await sendEmail({
    to: order.email,
    subject: `${site.name} — conferma ordine ${order.number}`,
    text:
      `Ciao ${order.firstName},\n\nabbiamo ricevuto il tuo ordine ${order.number}. Grazie!\n\n` +
      `${righe}\n\nSpedizione: ${formatPrice(order.shippingCents)}\nTotale: ${formatPrice(order.totalCents)}\n\n` +
      `Puoi seguire l'ordine qui:\n${trackUrl}\n\nA presto,\n${site.name}`,
  });

  await sendEmail({
    to: site.email,
    subject: `Nuovo ordine ${order.number} — ${formatPrice(order.totalCents)}`,
    text:
      `${order.firstName} ${order.lastName} <${order.email}>\n` +
      `${order.address1} ${order.address2}\n${order.zip} ${order.city} (${order.province}) — ${order.country}\n` +
      `Tel: ${order.phone}\n\n${righe}\n\nTotale: ${formatPrice(order.totalCents)}\nPagamento: ${provider} ${paymentRef}`,
  });

  return { ok: true as const, alreadyPaid: false as const };
}
