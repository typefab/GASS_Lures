/**
 * Configurazione centrale del negozio.
 * Cambia qui nome, contatti e regole commerciali: si propagano a tutto il sito.
 */
export const site = {
  name: "GASS Lures",
  shortName: "GASS",
  tagline: "Esche artigianali per la pesca a spinning",
  description:
    "Esche artigianali costruite a mano in Italia. Resina, componenti in acciaio inox e ancorette di qualità: ogni pezzo è unico e nasce per pescare davvero.",
  email: "info@gasslures.com",
  phone: "+39 000 000 0000",
  address: "Italia",
  vat: "IT00000000000",
  locale: "it-IT",
  currency: "EUR",
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    youtube: "",
  },
  /** Spedizione: importi in centesimi. */
  shipping: {
    freeThresholdCents: 9000, // spedizione gratuita sopra 90 €
    zones: [
      { code: "IT", label: "Italia", priceCents: 690, days: "2-4 giorni lavorativi" },
      { code: "EU", label: "Unione Europea", priceCents: 1490, days: "4-8 giorni lavorativi" },
      { code: "WORLD", label: "Resto del mondo", priceCents: 2490, days: "7-15 giorni lavorativi" },
    ],
  },
} as const;

export type ShippingZoneCode = (typeof site.shipping.zones)[number]["code"];

export function shippingZone(code: string) {
  return site.shipping.zones.find((z) => z.code === code) ?? site.shipping.zones[0];
}
