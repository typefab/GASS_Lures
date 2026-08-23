import type { Metadata } from "next";
import CheckoutForm from "@/components/CheckoutForm";
import { isPaymentsLive, isStripeTestMode } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Cassa", robots: { index: false, follow: false } };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ annullato?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="h-display text-4xl">Cassa</h1>
      <p className="mt-2 text-bone-dim">Ancora un passo e le esche sono tue.</p>
      <div className="mt-8">
        <CheckoutForm
          paymentsLive={isPaymentsLive()}
          testMode={isStripeTestMode()}
          cancelled={sp.annullato === "1"}
        />
      </div>
    </div>
  );
}
