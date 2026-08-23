export const ORDER_STATUS: Record<string, { label: string; hint: string; tone: string }> = {
  pending: { label: "In attesa di pagamento", hint: "Non abbiamo ancora ricevuto il pagamento.", tone: "text-bone-dim" },
  paid: { label: "Pagato", hint: "Stiamo preparando il pacco: parte entro 48 ore lavorative.", tone: "text-brass" },
  shipped: { label: "Spedito", hint: "Il pacco è in viaggio.", tone: "text-brass" },
  delivered: { label: "Consegnato", hint: "Consegna completata. Buona pesca!", tone: "text-brass-soft" },
  cancelled: { label: "Annullato", hint: "Questo ordine è stato annullato.", tone: "text-rust" },
  refunded: { label: "Rimborsato", hint: "L'importo è stato restituito.", tone: "text-rust" },
};

export const ORDER_STATUS_KEYS = Object.keys(ORDER_STATUS);
