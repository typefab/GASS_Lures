import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Accesso", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ da?: string }> }) {
  const sp = await searchParams;
  const configured = Boolean(process.env.ADMIN_PASSWORD && process.env.AUTH_SECRET);

  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <h1 className="h-display text-3xl">{site.name} · gestione</h1>
      <p className="mt-2 text-sm text-bone-dim">Area riservata al titolare del negozio.</p>

      {!configured && (
        <p className="mt-6 rounded-md border border-rust/50 bg-rust/10 p-3 text-sm">
          Mancano <code className="font-mono">ADMIN_PASSWORD</code> e/o <code className="font-mono">AUTH_SECRET</code>{" "}
          nelle variabili d&apos;ambiente: senza queste l&apos;accesso non può funzionare.
        </p>
      )}

      <LoginForm next={sp.da ?? "/admin"} />
    </div>
  );
}
