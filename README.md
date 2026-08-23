# GASS Lures — negozio online

Sito completo (vetrina + backend + pannello di gestione) per vendere esche artigianali.
È già funzionante: puoi navigare il catalogo, aggiungere al carrello, completare un ordine,
vederlo arrivare nel pannello di gestione e cambiarne lo stato.

Finché non colleghi Stripe il sito gira in **modalità dimostrativa**: il pagamento viene
simulato e l'ordine viene registrato come ordine di prova. Appena inserisci le chiavi Stripe
il checkout passa automaticamente ai pagamenti veri, senza toccare una riga di codice.

---

## Cosa c'è dentro

**Vetrina** (`/`)
- Home con prodotti in evidenza, categorie, storia del laboratorio, recensioni
- Catalogo `/shop` con filtri per categoria, assetto e ordinamento (funzionano anche senza JavaScript)
- Scheda prodotto con selettore colorazioni, giacenze reali, scheda tecnica e dati strutturati per Google
- Carrello persistente nel browser, con ricalcolo di prezzi e giacenze lato server
- Cassa con calcolo spedizione per zona e soglia di spedizione gratuita
- Conferma e tracciamento ordine (`/ordine`), pagine Chi siamo, Contatti, Spedizioni e resi, Termini, Privacy
- `robots.txt` e `sitemap.xml` generati automaticamente

**Backend**
- Database SQLite/libSQL con Drizzle ORM (prodotti, colorazioni, ordini, righe d'ordine, messaggi, newsletter)
- Prezzi e giacenze **sempre ricalcolati sul server**: il browser non può manipolare l'importo da pagare
- Stripe Checkout + webhook firmato (l'ordine diventa "pagato" solo dal webhook, mai dal redirect del browser)
- Gateway di prova integrato quando Stripe non è configurato
- Scarico automatico delle giacenze e invio email a pagamento confermato

**Pannello di gestione** (`/admin`)
- Riepilogo: incassato, ordini, scorte in esaurimento
- Ordini: elenco, dettaglio, cambio stato e codice di tracciamento
- Prodotti: creazione, modifica, colorazioni con SKU/giacenza/colori, eliminazione
- Messaggi dal modulo contatti e iscritti alla newsletter
- Accesso protetto da password con cookie firmato (HMAC-SHA256), scadenza 12 ore

---

## Avvio in locale

```bash
npm install
cp .env.example .env.local     # poi apri .env.local e compila i valori
npm run setup                  # crea le tabelle e carica il catalogo di esempio
npm run dev                    # http://localhost:3000
```

Il pannello di gestione è su http://localhost:3000/admin con la password che hai messo in
`ADMIN_PASSWORD`.

Comandi utili:

| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | Server di sviluppo |
| `npm run build` / `npm start` | Build e avvio in produzione |
| `npm run lint` | Controllo del codice |
| `npm run db:push` | Applica lo schema al database |
| `npm run db:seed` | Ricarica il catalogo di esempio (**cancella i prodotti**, non gli ordini) |
| `npm run db:studio` | Interfaccia grafica sul database |

---

## Variabili d'ambiente

Tutte descritte in `.env.example`. Le essenziali:

| Variabile | Obbligatoria | A cosa serve |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | sì | URL pubblico del sito, usato nei link delle email e nella sitemap |
| `DATABASE_URL` | sì | `file:./data/gass.db` in locale, `libsql://…` su Turso in produzione |
| `DATABASE_AUTH_TOKEN` | in produzione | Token Turso |
| `ADMIN_PASSWORD` | sì | Password del pannello di gestione |
| `AUTH_SECRET` | sì | Chiave per firmare il cookie di sessione (`openssl rand -base64 32`) |
| `STRIPE_SECRET_KEY` | no | Se vuota → modalità dimostrativa |
| `STRIPE_WEBHOOK_SECRET` | no | Necessaria per incassare davvero |
| `RESEND_API_KEY` | no | Se vuota, le email vengono scritte nei log invece che inviate |

---

## Pubblicare il sito gratis

### 1. Database — Turso (piano gratuito)

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth signup
turso db create gass-lures
turso db show gass-lures --url          # → DATABASE_URL
turso db tokens create gass-lures       # → DATABASE_AUTH_TOKEN
```

Poi, con quelle due variabili in `.env.local`:

```bash
npm run db:push && npm run db:seed
```

### 2. Hosting — Vercel (piano Hobby, gratuito)

1. Fai il push del repository su GitHub.
2. Su [vercel.com](https://vercel.com) → *Add New Project* → importa il repository.
3. Inserisci le variabili d'ambiente elencate sopra.
4. *Deploy*. Ottieni subito un indirizzo tipo `gass-lures.vercel.app`.

> **Da sapere prima di vendere sul serio.** Il piano Hobby di Vercel è destinato a progetti
> personali e non commerciali: va benissimo per la fase di collaudo, ma quando inizi a
> incassare devi passare al piano Pro (circa 20 $/mese) **oppure** spostare l'hosting su una
> piattaforma il cui piano gratuito consente l'uso commerciale — Cloudflare Workers e Netlify
> sono le alternative più immediate. Il codice non cambia: cambia solo dove gira.

### 3. Dominio

Per non spendere nulla adesso puoi usare il sottodominio gratuito dell'hosting
(`gass-lures.vercel.app`) e collegare più avanti un dominio tuo: su Vercel si aggiunge da
*Settings → Domains*, e l'unico costo è la registrazione del dominio (un `.it` o un `.com`
stanno intorno ai 10-15 € l'anno). Quando lo fai, aggiorna `NEXT_PUBLIC_SITE_URL` e l'URL del
webhook Stripe.

### 4. Pagamenti — Stripe

Aprire un account Stripe è gratuito; si paga solo una commissione sulle transazioni riuscite.

1. Registrati su [stripe.com](https://stripe.com) e resta in **modalità test**.
2. Copia la chiave segreta di test (`sk_test_…`) in `STRIPE_SECRET_KEY`.
3. Crea un webhook che punti a `https://TUO-DOMINIO/api/webhooks/stripe`, evento
   `checkout.session.completed`; copia il segreto (`whsec_…`) in `STRIPE_WEBHOOK_SECRET`.
4. Prova un acquisto con la carta `4242 4242 4242 4242`, scadenza futura, CVC qualsiasi.
5. Quando è tutto verificato, completa l'attivazione dell'account e sostituisci le chiavi di
   test con quelle live.

### 5. Email (facoltativo)

Senza `RESEND_API_KEY` le email di conferma vengono solo scritte nei log del server: comodo
per collaudare, inutile per i clienti veri. Per attivarle davvero: account su
[resend.com](https://resend.com) (piano gratuito fino a 3.000 email/mese), verifica del
dominio, chiave API in `RESEND_API_KEY`.

---

## Come si carica un prodotto vero

1. Entra in `/admin/prodotti` → *Nuovo prodotto*.
2. Compila nome, prezzo, categoria, misure e descrizione, poi salva.
3. Aggiungi una colorazione per ogni versione in vendita: ognuna ha SKU e giacenza propri.
4. I quattro selettori di colore generano l'illustrazione vettoriale mostrata sul sito.
   Appena incolli l'URL di una **foto reale** nel campo apposito, la foto sostituisce il disegno.

Le illustrazioni generate servono proprio a questo: avere un sito presentabile da subito e
sostituire le immagini una alla volta, senza mai lasciare buchi nella vetrina.

---

## Note tecniche

- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4
- Drizzle ORM su libSQL: stesso dialetto SQL in locale (file) e in produzione (Turso)
- Il carrello vive in `localStorage` ed è letto con `useSyncExternalStore`, quindi non c'è
  disallineamento fra HTML del server e prima renderizzazione nel browser
- L'area `/admin` è protetta dal middleware **e** da un controllo dentro ogni azione server
- `npm audit` segnala 4 avvisi *moderate* su `drizzle-kit`: riguardano il server di sviluppo
  di esbuild, che non viene mai eseguito in produzione

## Cosa manca prima della vendita reale

Vedi [`CHECKLIST.md`](./CHECKLIST.md).
