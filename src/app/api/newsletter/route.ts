import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { newsletter } from "@/lib/db/schema";
import { newId } from "@/lib/id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ email: z.email() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Inserisci un indirizzo email valido." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  try {
    await db.insert(newsletter).values({ id: newId("nws"), email });
  } catch {
    // email già iscritta: per l'utente il risultato è lo stesso
    return NextResponse.json({ message: "Sei già iscritto. A presto!" });
  }
  return NextResponse.json({ message: "Iscrizione registrata. Benvenuto a bordo!" });
}
