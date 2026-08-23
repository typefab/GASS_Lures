"use client";

import { useState } from "react";

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setState("loading");
    try {
      const res = await fetch("/api/contatti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Invio non riuscito");
      setState("ok");
      setMessage(json.message);
      form.reset();
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Invio non riuscito");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Nome <span className="text-brass">*</span>
          </label>
          <input id="name" name="name" required minLength={2} className="mt-1.5 w-full rounded-md border border-line bg-ink-2 px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email <span className="text-brass">*</span>
          </label>
          <input id="email" name="email" type="email" required className="mt-1.5 w-full rounded-md border border-line bg-ink-2 px-3 py-2.5 text-sm" />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium">
          Oggetto
        </label>
        <input id="subject" name="subject" className="mt-1.5 w-full rounded-md border border-line bg-ink-2 px-3 py-2.5 text-sm" />
      </div>
      <div>
        <label htmlFor="body" className="block text-sm font-medium">
          Messaggio <span className="text-brass">*</span>
        </label>
        <textarea id="body" name="body" rows={6} required minLength={10} className="mt-1.5 w-full rounded-md border border-line bg-ink-2 px-3 py-2.5 text-sm" />
      </div>
      <button
        type="submit"
        disabled={state === "loading"}
        className="rounded-md bg-brass px-6 py-3 font-bold text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {state === "loading" ? "Invio…" : "Invia messaggio"}
      </button>
      {message && (
        <p className={`text-sm ${state === "ok" ? "text-brass-soft" : "text-rust"}`} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
