import { isPreviewDatabase } from "@/lib/db";

/**
 * Avviso mostrato solo quando il sito gira su database temporaneo.
 * Serve a non far credere a un cliente vero che il suo ordine sia registrato.
 */
export default function PreviewBanner() {
  if (!isPreviewDatabase) return null;

  return (
    <p className="border-b border-rust/40 bg-rust/15 px-4 py-2 text-center text-xs text-bone">
      <strong className="font-bold">Sito in prova.</strong> Ordini e pagamenti sono simulati e i dati
      vengono azzerati periodicamente. Non è ancora un negozio attivo.
    </p>
  );
}
