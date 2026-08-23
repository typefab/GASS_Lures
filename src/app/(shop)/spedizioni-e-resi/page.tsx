import type { Metadata } from "next";
import Link from "next/link";
import Prose from "@/components/Prose";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Spedizioni e resi",
  description: "Tempi, costi di spedizione e condizioni di reso.",
};

export default function ShippingPage() {
  return (
    <Prose title="Spedizioni e resi">
      <h2>Costi e tempi</h2>
      <ul>
        {site.shipping.zones.map((z) => (
          <li key={z.code}>
            <strong>{z.label}</strong> — {formatPrice(z.priceCents)} · consegna in {z.days}
          </li>
        ))}
      </ul>
      <p>
        La spedizione è <strong>gratuita</strong> per tutti gli ordini superiori a{" "}
        {formatPrice(site.shipping.freeThresholdCents)}, indipendentemente dalla destinazione.
      </p>

      <h2>Preparazione dell&apos;ordine</h2>
      <p>
        Gli ordini ricevuti entro le 14:00 dei giorni feriali vengono preparati lo stesso giorno. Trattandosi
        di produzione artigianale, se un articolo dovesse risultare non disponibile ti contattiamo entro 24 ore
        proponendoti un&apos;alternativa o il rimborso immediato.
      </p>

      <h2>Tracciamento</h2>
      <p>
        Appena il pacco parte ricevi un&apos;email con il codice di tracciamento. Puoi controllare lo stato in
        qualsiasi momento dalla pagina <Link href="/ordine">Traccia il tuo ordine</Link>.
      </p>

      <h2>Diritto di recesso</h2>
      <p>
        Se sei un consumatore hai <strong>14 giorni</strong> dalla consegna per esercitare il diritto di
        recesso, senza doverne indicare il motivo. È sufficiente scriverci a{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a> indicando il numero d&apos;ordine.
      </p>
      <p>
        La merce va restituita integra, non utilizzata e nella confezione originale. Le spese di restituzione
        sono a carico dell&apos;acquirente, salvo prodotto difettoso o errore nostro. Il rimborso viene
        effettuato entro 14 giorni dal ricevimento del reso, con lo stesso mezzo di pagamento usato per
        l&apos;acquisto.
      </p>

      <h2>Prodotti difettosi</h2>
      <p>
        Ogni esca viene controllata e collaudata prima della spedizione. Se ricevi un pezzo difettoso mandaci
        una foto entro 14 giorni: lo sostituiamo o lo rimborsiamo, spese di rientro incluse.
      </p>
      <p>
        Le esche sono attrezzi da pesca: usura, graffi e segni di denti derivanti dall&apos;uso non sono
        considerati difetti.
      </p>
    </Prose>
  );
}
