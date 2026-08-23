"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Iscrizione non riuscita");
      setState("ok");
      setMessage(data.message ?? "Iscrizione registrata. A presto!");
      setEmail("");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Iscrizione non riuscita");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4">
      <label htmlFor="newsletter-email" className="sr-only">
        Indirizzo email
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="la-tua@email.it"
          className="min-w-0 flex-1 rounded-md border border-line bg-ink-2 px-3 py-2.5 text-sm placeholder:text-bone-dim/60"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-md bg-brass px-4 py-2.5 text-sm font-bold text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {state === "loading" ? "…" : "Iscriviti"}
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-xs ${state === "ok" ? "text-brass-soft" : "text-rust"}`} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
