# Checklist prima di vendere davvero

Il sito è già operativo in modalità di prova. Qui c'è tutto quello che serve per passare
dal collaudo alle vendite vere, diviso per chi deve procurarlo.

---

## 1. Dati che servono a me (dimmeli e li inserisco)

Sono nel file `src/lib/site.ts` e nelle pagine legali: adesso ci sono segnaposto.

- [ ] **Nome esatto del marchio** — ora è "GASS Lures"
- [ ] **Ragione sociale, sede legale, partita IVA** (servono in Termini, Privacy e footer)
- [ ] **Email di contatto vera** — ora `info@gasslures.com`
- [ ] **Telefono** (se vuoi mostrarlo)
- [ ] **Link Instagram / Facebook / YouTube** reali
- [ ] **Costi e tempi di spedizione reali** e soglia per la spedizione gratuita
      (ora: 6,90 € Italia, 14,90 € UE, 24,90 € resto del mondo, gratis sopra 90 €)
- [ ] **Catalogo vero**: nome, prezzo, misure, descrizione e colorazioni di ogni esca
- [ ] **Foto dei prodotti** — finché non ci sono, il sito mostra illustrazioni generate

## 2. Account da aprire (gratuiti, li apri tu perché sono intestati a te)

- [ ] **GitHub** — per ospitare il codice (già fatto se stai leggendo questo file lì)
- [ ] **Turso** — database, piano gratuito: mi servono `DATABASE_URL` e `DATABASE_AUTH_TOKEN`
- [ ] **Vercel** (o Cloudflare/Netlify) — hosting, collegato al repository GitHub
- [ ] **Stripe** — pagamenti. Aprirlo è gratis, si paga solo la commissione sugli incassi.
      Per l'attivazione servono i tuoi dati fiscali e un IBAN.
      Mi servono `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET`
- [ ] **Resend** (facoltativo) — invio email di conferma, gratis fino a 3.000 al mese

> **Attenzione alle chiavi:** `STRIPE_SECRET_KEY`, `DATABASE_AUTH_TOKEN`, `ADMIN_PASSWORD` e
> `AUTH_SECRET` non vanno mai scritte in chiaro in una chat né salvate nel repository. Vanno
> inserite direttamente nel pannello dell'hosting, sotto *Environment Variables*. Se una ti
> sfugge per errore, rigenerala dal pannello del servizio.

## 3. Cose che costano (quando vorrai farle)

| Voce | Costo indicativo | Quando serve |
| --- | --- | --- |
| Dominio `.it` o `.com` | 10-15 € l'anno | Quando vuoi un indirizzo tuo al posto di `*.vercel.app` |
| Hosting per uso commerciale | 0 € su Cloudflare/Netlify, ~20 $/mese su Vercel Pro | Prima di incassare il primo ordine vero |
| Commissioni Stripe | ~1,5% + 0,25 € per carte europee | Solo sulle transazioni riuscite |

## 4. Adempimenti che riguardano te, non il sito

Il codice è pronto, ma vendere online in Italia richiede anche:

- [ ] Partita IVA e inquadramento fiscale corretto per la vendita a distanza
- [ ] Verifica delle pagine **Termini e condizioni** e **Privacy** da parte di un
      commercialista o di un legale: i testi che ho scritto sono una bozza di partenza,
      non una consulenza
- [ ] Registro dei corrispettivi / fatturazione elettronica secondo il tuo regime
- [ ] Eventuale iscrizione al registro delle imprese / SCIA per il commercio elettronico

## 5. Funzioni oggi simulate (attive appena arrivano le chiavi)

| Funzione | Stato attuale | Come si attiva |
| --- | --- | --- |
| Pagamento con carta | Simulato: pagina di prova con esito a scelta | Chiavi Stripe |
| Email di conferma ordine | Scritte nei log del server | Chiave Resend |
| Email al negozio per nuovo ordine | Scritte nei log del server | Chiave Resend |
| Foto prodotto | Illustrazioni vettoriali generate dai colori | Carichi le foto vere |
| Recensioni in home | Testi di esempio | Le sostituiamo con recensioni reali |
| Tracciamento spedizione | Campo libero compilato a mano in `/admin` | Va bene così, oppure integriamo il corriere |

## 6. Idee per dopo

- Codici sconto e buoni regalo
- Area cliente con storico ordini
- Recensioni verificate sui prodotti
- Vendita in più lingue (il sito è già pronto per l'italiano, si aggiunge l'inglese)
- Notifica automatica "torna disponibile" per le colorazioni esaurite
