import { site } from "./site";

export function formatPrice(cents: number, currency: string = site.currency) {
  return new Intl.NumberFormat(site.locale, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatDate(unixSeconds: number) {
  return new Intl.DateTimeFormat(site.locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(unixSeconds * 1000));
}

/** 145 decigrammi -> "14,5 g" */
export function formatWeight(decigrams: number | null) {
  if (!decigrams) return null;
  return `${new Intl.NumberFormat(site.locale, { maximumFractionDigits: 1 }).format(decigrams / 10)} g`;
}

export function formatLength(mm: number | null) {
  if (!mm) return null;
  return `${new Intl.NumberFormat(site.locale, { maximumFractionDigits: 1 }).format(mm / 10)} cm`;
}

export const ACTION_LABELS: Record<string, string> = {
  floating: "Galleggiante",
  sinking: "Affondante",
  suspending: "Sospensiva",
  soft: "Siliconica",
  merch: "Abbigliamento",
};
