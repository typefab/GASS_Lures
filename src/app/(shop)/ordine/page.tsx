import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Traccia il tuo ordine",
  description: "Controlla lo stato del tuo ordine GASS Lures.",
};

async function findOrder(formData: FormData) {
  "use server";
  const numero = String(formData.get("numero") ?? "").trim().toUpperCase();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!numero || !email) redirect("/ordine?errore=1");
  redirect(`/ordine/${encodeURIComponent(numero)}?email=${encodeURIComponent(email)}`);
}

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ errore?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <h1 className="h-display text-4xl">Traccia il tuo ordine</h1>
      <p className="mt-3 text-bone-dim">
        Inserisci il numero d&apos;ordine che trovi nell&apos;email di conferma e l&apos;indirizzo email usato
        per l&apos;acquisto.
      </p>

      {sp.errore && (
        <p className="mt-6 rounded-md border border-rust/50 bg-rust/10 p-3 text-sm" role="alert">
          Compila entrambi i campi.
        </p>
      )}

      <form action={findOrder} className="mt-8 space-y-4">
        <div>
          <label htmlFor="numero" className="block text-sm font-medium">
            Numero ordine
          </label>
          <input
            id="numero"
            name="numero"
            required
            placeholder="GL-250823-4F7A"
            className="mt-1.5 w-full rounded-md border border-line bg-ink-2 px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1.5 w-full rounded-md border border-line bg-ink-2 px-3 py-2.5 text-sm"
          />
        </div>
        <button type="submit" className="w-full rounded-md bg-brass px-6 py-3 font-bold text-ink">
          Cerca l&apos;ordine
        </button>
      </form>
    </div>
  );
}
