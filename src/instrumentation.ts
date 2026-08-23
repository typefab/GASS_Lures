/**
 * Eseguito una volta all'avvio del server, prima di servire qualsiasi richiesta.
 * Lo usiamo per assicurarci che il database sia pronto: al primo deploy crea le
 * tabelle e carica il catalogo, senza bisogno di lanciare comandi a mano.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { ensureDatabase } = await import("./lib/db/bootstrap");
  await ensureDatabase();
}
