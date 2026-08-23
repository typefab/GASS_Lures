import "server-only";
import Stripe from "stripe";

let cached: Stripe | null = null;

/** Ritorna il client Stripe, oppure null se le chiavi non sono configurate. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!cached) cached = new Stripe(key);
  return cached;
}

/** true quando il sito accetta pagamenti reali; false = modalità dimostrativa. */
export function isPaymentsLive() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** true se le chiavi sono di test (sk_test_…): utile per avvisare in interfaccia. */
export function isStripeTestMode() {
  return (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_");
}
