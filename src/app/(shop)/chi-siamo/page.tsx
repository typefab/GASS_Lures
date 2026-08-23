import type { Metadata } from "next";
import Link from "next/link";
import LureArt from "@/components/LureArt";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Chi siamo",
  description: `La storia di ${site.name}: un laboratorio artigiano che costruisce esche a mano, una alla volta.`,
};

const STEPS = [
  { n: "01", t: "Il progetto", d: "Ogni modello nasce da un disegno e da un prototipo in legno provato in vasca e in acqua libera. Se non convince, non va in produzione." },
  { n: "02", t: "La colata", d: "Dal prototipo ricaviamo uno stampo in silicone. La resina bicomponente viene colata a mano e lasciata polimerizzare 24 ore." },
  { n: "03", t: "Zavorra e assetto", d: "Ogni corpo viene pesato e zavorrato singolarmente: è il passaggio che decide come nuota l'esca." },
  { n: "04", t: "Verniciatura", d: "Fondo, colore ad aerografo, occhi applicati a mano e tre mani di resina UV per proteggere tutto." },
  { n: "05", t: "Montaggio e collaudo", d: "Occhielli in acciaio inox, anelli spaccati e ancorette. Poi la prova finale in vasca: se non nuota, si ricomincia." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <p className="eyebrow">La nostra impresa</p>
      <h1 className="h-display mt-2 text-4xl sm:text-5xl">Un laboratorio, non una fabbrica</h1>

      <div className="mt-8 space-y-5 text-lg leading-relaxed text-bone-dim">
        <p>
          {site.name} nasce da una passione che dura da sempre: la pesca a spinning nei canali, nelle rogge e
          nei laghi di casa. Posti poco spettacolari, spesso a due passi dal traffico, dove i pesci sono
          diffidenti e le esche prodotte in serie smettono presto di funzionare.
        </p>
        <p>
          Da lì l&apos;idea di costruircele da soli. Prima per noi, poi per gli amici, poi per chi ce le
          chiedeva dopo averle viste in azione. Oggi produciamo poche decine di pezzi al mese, tutti a mano,
          uno alla volta.
        </p>
        <p>
          Non facciamo grandi numeri e non vogliamo farli: preferiamo che ogni esca esca dal laboratorio
          soltanto quando è pronta davvero.
        </p>
      </div>

      <div className="my-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {["#3d5a2a,#e8dfae,#1c2a14,#f4b400", "#5c7f96,#f2f2ef,#2b3f4d,#d94f2b", "#a9772f,#f0e0c0,#5b3d12,#2b2b2b", "#1f3a63,#dfe8f2,#0c1a2e,#e8c33a"].map((p, i) => (
          <div key={i} className="rounded-lg border border-line bg-ink-2 p-3">
            <LureArt palette={JSON.stringify(p.split(","))} uid={`about-${i}`} className="w-full" />
          </div>
        ))}
      </div>

      <h2 className="h-display text-3xl">Come nasce un&apos;esca</h2>
      <ol className="mt-6 space-y-6">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-5 border-b border-line pb-6 last:border-0">
            <span className="font-display text-3xl font-semibold text-brass">{s.n}</span>
            <div>
              <h3 className="h-display text-xl">{s.t}</h3>
              <p className="mt-1.5 leading-relaxed text-bone-dim">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-12 rounded-lg border border-line bg-ink-2 p-8 text-center">
        <h2 className="h-display text-2xl">Hai un&apos;idea per una colorazione?</h2>
        <p className="mt-2 text-bone-dim">Scrivici: le serie limitate nascono quasi sempre da una richiesta.</p>
        <Link href="/contatti" className="mt-6 inline-block rounded-md bg-brass px-6 py-3 font-bold text-ink">
          Contattaci
        </Link>
      </div>
    </div>
  );
}
