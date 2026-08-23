"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input type="hidden" name="da" value={next} />
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          autoFocus
          className="mt-1.5 w-full rounded-md border border-line bg-ink-2 px-3 py-2.5 text-sm"
        />
      </div>
      {state?.error && (
        <p className="rounded-md border border-rust/50 bg-rust/10 p-3 text-sm" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brass px-6 py-3 font-bold text-ink disabled:opacity-60"
      >
        {pending ? "Verifico…" : "Entra"}
      </button>
    </form>
  );
}
