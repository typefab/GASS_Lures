import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { newsletter } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Newsletter" };

export default async function AdminNewsletterPage() {
  const rows = await db.select().from(newsletter).orderBy(desc(newsletter.createdAt)).limit(1000);

  return (
    <div className="max-w-2xl">
      <h1 className="h-display text-3xl">Newsletter</h1>
      <p className="mt-2 text-sm text-bone-dim">{rows.length} iscritti.</p>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-lg border border-line p-8 text-sm text-bone-dim">Ancora nessun iscritto.</p>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-line rounded-lg border border-line">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                <a href={`mailto:${r.email}`} className="truncate text-brass underline">
                  {r.email}
                </a>
                <span className="shrink-0 text-xs text-bone-dim">{formatDate(r.createdAt)}</span>
              </li>
            ))}
          </ul>

          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-bone-dim">
              Mostra tutti gli indirizzi separati da virgola (per copiarli)
            </summary>
            <textarea
              readOnly
              rows={5}
              value={rows.map((r) => r.email).join(", ")}
              className="mt-3 w-full rounded-md border border-line bg-ink-2 p-3 text-xs"
            />
          </details>
        </>
      )}
    </div>
  );
}
