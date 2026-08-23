import type { Metadata } from "next";
import Link from "next/link";
import Prose, { ToDo } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termini e condizioni",
  description: "Condizioni generali di vendita.",
};

export default function TermsPage() {
  return (
    <Prose title="Termini e condizioni di vendita">
      <p className="rounded-md border border-brass/40 bg-brass/5 p-4">
        <strong>Da completare prima di iniziare a vendere davvero.</strong> Questo testo è una bozza di
        partenza: sostituisci i campi evidenziati con i dati reali dell&apos;attività e fallo verificare da un
        commercialista o da un legale.
      </p>

      <h2>1. Titolare del sito</h2>
      <p>
        Il sito {site.name} è gestito da <ToDo>ragione sociale</ToDo>, con sede in <ToDo>indirizzo completo</ToDo>,
        P.IVA <ToDo>partita IVA</ToDo>, email <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>2. Oggetto</h2>
      <p>
        Le presenti condizioni regolano la vendita a distanza dei prodotti presenti sul sito. Effettuando un
        ordine dichiari di averle lette e accettate.
      </p>

      <h2>3. Prodotti e prezzi</h2>
      <p>
        Tutti i prezzi sono espressi in euro e comprensivi di IVA, se dovuta. Le spese di spedizione sono
        indicate separatamente prima della conferma d&apos;ordine. Trattandosi di prodotti artigianali,
        possono esistere lievi differenze estetiche fra il prodotto ricevuto e le immagini pubblicate.
      </p>

      <h2>4. Conclusione del contratto</h2>
      <p>
        Il contratto si intende concluso quando ricevi via email la conferma dell&apos;ordine. Ci riserviamo
        la facoltà di non accettare ordini incompleti, sospetti o non evadibili, rimborsando integralmente
        quanto eventualmente già pagato.
      </p>

      <h2>5. Pagamenti</h2>
      <p>
        I pagamenti con carta sono gestiti da Stripe Payments Europe Ltd. I dati della carta non transitano
        né vengono conservati sui nostri sistemi.
      </p>

      <h2>6. Spedizioni, recesso e garanzia</h2>
      <p>
        Consulta la pagina <Link href="/spedizioni-e-resi">Spedizioni e resi</Link>, che è parte integrante delle
        presenti condizioni. Ai prodotti si applica la garanzia legale di conformità di 24 mesi prevista dal
        Codice del Consumo.
      </p>

      <h2>7. Uso dei prodotti</h2>
      <p>
        Le esche sono dotate di ami affilati: vanno maneggiate con attenzione e tenute fuori dalla portata dei
        bambini. Sei tenuto a rispettare la normativa sulla pesca vigente nel luogo in cui le utilizzi
        (licenze, periodi di divieto, misure minime).
      </p>

      <h2>8. Legge applicabile e foro</h2>
      <p>
        Il contratto è regolato dalla legge italiana. Per i consumatori è competente il foro del luogo di
        residenza o domicilio. Per le controversie è possibile ricorrere alla piattaforma ODR della
        Commissione Europea.
      </p>
    </Prose>
  );
}
