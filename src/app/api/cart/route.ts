import { NextResponse } from "next/server";
import { z } from "zod";
import { priceCart } from "@/lib/cart-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  items: z
    .array(z.object({ variantId: z.string().min(1), quantity: z.number().int().positive() }))
    .max(50),
  zone: z.string().optional(),
});

/** Ricalcola il carrello sul server: è la sola fonte attendibile per prezzi e giacenze. */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Carrello non valido" }, { status: 400 });
  }
  const cart = await priceCart(parsed.data.items, parsed.data.zone ?? "IT");
  return NextResponse.json(cart);
}
