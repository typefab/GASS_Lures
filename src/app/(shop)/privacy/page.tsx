import type { Metadata } from "next";
import Prose, { ToDo } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy e cookie",
  description: "Come trattiamo i dati personali di chi visita il sito e acquista.",
};

export default function PrivacyPage() {
  return (
    <Prose title="Privacy e cookie">
      <p className="rounded-md border border-brass/40 bg-brass/5 p-4">
        <strong>Da completare prima della messa online definitiva</strong> con i dati reali del titolare del
        trattamento.
      </p>

      <h2>Titolare del trattamento</h2>
      <p>
        <ToDo>ragione sociale</ToDo>, <ToDo>indirizzo</ToDo> — email{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>Quali dati raccogliamo</h2>
      <ul>
        <li>
          <strong>Dati d&apos;ordine</strong>: nome, cognome, email, telefono, indirizzo di spedizione, contenuto
          ed importo dell&apos;ordine. Servono a eseguire il contratto (art. 6.1.b GDPR).
        </li>
        <li>
          <strong>Dati di pagamento</strong>: gestiti direttamente da Stripe. Noi conserviamo solo
          l&apos;identificativo della transazione, mai il numero della carta.
        </li>
        <li>
          <strong>Newsletter</strong>: il tuo indirizzo email, sulla base del consenso che puoi revocare in
          qualsiasi momento.
        </li>
        <li>
          <strong>Messaggi dal modulo contatti</strong>: nome, email e testo del messaggio, per poterti
          rispondere.
        </li>
      </ul>

      <h2>Cookie</h2>
      <p>
        Il sito non utilizza cookie di profilazione né strumenti di tracciamento pubblicitario. Il carrello è
        salvato nella memoria locale del tuo browser e non viene trasmesso a terzi. L&apos;accesso all&apos;area
        di amministrazione usa un cookie tecnico di sessione.
      </p>

      <h2>Conservazione</h2>
      <p>
        I dati relativi agli ordini sono conservati per il tempo previsto dagli obblighi fiscali (10 anni). Gli
        iscritti alla newsletter restano in archivio fino alla revoca del consenso.
      </p>

      <h2>Destinatari</h2>
      <p>
        Comunichiamo i dati soltanto a chi ci serve per far arrivare il pacco e incassare il pagamento:
        corriere, Stripe, fornitore di hosting e servizio di invio email. Nessun dato viene venduto.
      </p>

      <h2>I tuoi diritti</h2>
      <p>
        Puoi chiedere in qualsiasi momento accesso, rettifica, cancellazione, limitazione e portabilità dei tuoi
        dati, oppure opporti al trattamento, scrivendo a <a href={`mailto:${site.email}`}>{site.email}</a>. Hai
        inoltre diritto di reclamo al Garante per la protezione dei dati personali.
      </p>
    </Prose>
  );
}
