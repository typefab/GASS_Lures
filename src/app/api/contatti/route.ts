import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { newId } from "@/lib/id";
import { sendEmail } from "@/lib/email";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  subject: z.string().max(160).optional().default(""),
  body: z.string().min(10).max(4000),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Controlla i campi: nome, email e un messaggio di almeno 10 caratteri." },
      { status: 400 },
    );
  }

  const { name, email, subject, body } = parsed.data;
  await db.insert(messages).values({ id: newId("msg"), name, email: email.toLowerCase(), subject, body });

  await sendEmail({
    to: site.email,
    subject: `Nuovo messaggio dal sito — ${subject || "senza oggetto"}`,
    text: `Da: ${name} <${email}>\n\n${body}`,
    replyTo: email,
  });

  return NextResponse.json({ message: "Messaggio inviato. Ti rispondiamo entro un giorno lavorativo." });
}
