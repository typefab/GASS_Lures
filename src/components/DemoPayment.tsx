"use client";

import { useState } from "react";

export default function DemoPayment({ orderId, token }: { orderId: string; token: string }) {
  const [busy, setBusy] = useState<"success" | "failure" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(outcome: "success" | "failure") {
    setBusy(outcome);
    setError(null);
    try {
      const res = await fetch("/api/checkout/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, token, outcome }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operazione non riuscita");
      window.location.href = data.redirect;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operazione non riuscita");
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => decide("success")}
          disabled={busy !== null}
          className="flex-1 rounded-md bg-brass px-6 py-3 font-bold text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy === "success" ? "Elaboro…" : "Simula pagamento riuscito"}
        </button>
        <button
          type="button"
          onClick={() => decide("failure")}
          disabled={busy !== null}
          className="flex-1 rounded-md border border-line px-6 py-3 font-semibold transition-colors hover:border-rust hover:text-rust disabled:opacity-60"
        >
          {busy === "failure" ? "Annullo…" : "Simula pagamento rifiutato"}
        </button>
      </div>
      {error && (
        <p className="mt-4 rounded-md border border-rust/50 bg-rust/10 p-3 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
