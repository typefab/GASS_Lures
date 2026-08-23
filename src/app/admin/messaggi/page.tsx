import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { toggleMessage } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Messaggi" };

export default async function AdminMessagesPage() {
  const rows = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(200);

  return (
    <div className="max-w-3xl">
      <h1 className="h-display text-3xl">Messaggi</h1>
      <p className="mt-2 text-sm text-bone-dim">Arrivano dal modulo contatti del sito.</p>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-lg border border-line p-8 text-sm text-bone-dim">Nessun messaggio ricevuto.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((m) => (
            <li key={m.id} className={`rounded-lg border p-5 ${m.handled ? "border-line opacity-60" : "border-brass/40 bg-ink-2"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">
                  {m.name}{" "}
                  <a href={`mailto:${m.email}`} className="font-normal text-brass underline">
                    {m.email}
                  </a>
                </p>
                <p className="text-xs text-bone-dim">{formatDate(m.createdAt)}</p>
              </div>
              {m.subject && <p className="mt-1 text-sm font-medium">{m.subject}</p>}
              <p className="mt-3 whitespace-pre-wrap text-sm text-bone-dim">{m.body}</p>
              <form action={toggleMessage} className="mt-4">
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="handled" value={m.handled ? "0" : "1"} />
                <button type="submit" className="text-sm text-bone-dim underline hover:text-bone">
                  {m.handled ? "Segna come da gestire" : "Segna come gestito"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
