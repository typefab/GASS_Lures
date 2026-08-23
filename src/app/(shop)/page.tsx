import Link from "next/link";
import LureArt from "@/components/LureArt";
import ProductCard from "@/components/ProductCard";
import { getCategories, listProducts } from "@/lib/catalog";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const PROMISES = [
  { title: "Fatte a mano", text: "Colata, carteggiatura e verniciatura: ogni esca passa dalle nostre mani." },
  { title: "Collaudate in vasca", text: "Nessuna esca lascia il laboratorio senza aver nuotato almeno una volta." },
  { title: "Spedizione in 48h", text: "Ordini entro le 14:00 nei giorni feriali: spediamo il giorno stesso." },
  { title: "Pagamenti sicuri", text: "Carte, Apple Pay e Google Pay gestiti da Stripe. Nessun dato salvato da noi." },
];

const REVIEWS = [
  { text: "Il Ghisa 90 ha fatto due lucci in una mattinata sul Ticino. Nuota che è una meraviglia anche in corrente.", author: "Marco B.", place: "Pavia" },
  { text: "Finiture da collezione ma nate per pescare. Ho preso l'Alborella 45 per i cavedani: micidiale.", author: "Silvia T.", place: "Trento" },
  { text: "Ordinato lunedì, arrivato mercoledì. Assistenza rapidissima quando ho chiesto consiglio sui colori.", author: "Andrea P.", place: "Bari" },
];

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    listProducts({ featuredOnly: true, limit: 4 }),
    getCategories(),
  ]);
  const novita = await listProducts({ limit: 8 });
  const heroVariant = featured[0]?.variants[0];

  return (
    <>
      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_20%,rgba(200,162,74,0.14),transparent_60%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div className="relative">
            <p className="eyebrow">Laboratorio artigiano · Italia</p>
            <h1 className="h-display mt-4 text-5xl sm:text-6xl lg:text-7xl">
              Esche costruite
              <br />
              <span className="text-brass">una alla volta</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-bone-dim">
              Resina colata a mano, componenti in acciaio inox, ancorette affilate chimicamente.
              Nate sui canali di pianura, provate dove l&apos;acqua è difficile.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-md bg-brass px-6 py-3 font-bold text-ink transition-opacity hover:opacity-90"
              >
                Scopri le esche
              </Link>
              <Link
                href="/chi-siamo"
                className="rounded-md border border-line px-6 py-3 font-semibold transition-colors hover:border-brass hover:text-brass"
              >
                Come le costruiamo
              </Link>
            </div>
            <p className="mt-6 text-sm text-bone-dim">
              Spedizione gratuita in Italia sopra {formatPrice(site.shipping.freeThresholdCents)}
            </p>
          </div>

          <div className="relative">
            <div className="rounded-xl border border-line bg-ink-2 p-6 shadow-2xl">
              <LureArt
                palette={heroVariant?.palette ?? '["#3d5a2a","#e8dfae","#1c2a14","#f4b400"]'}
                kind="minnow"
                uid="hero"
                className="w-full"
                label="Illustrazione di un minnow artigianale GASS Lures"
              />
              {featured[0] && (
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <div>
                    <p className="eyebrow">In evidenza</p>
                    <p className="h-display text-lg">{featured[0].name}</p>
                  </div>
                  <Link href={`/prodotti/${featured[0].slug}`} className="text-sm font-semibold text-brass hover:underline">
                    Vedi →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------- PROMESSE ----------------------------- */}
      <section className="border-b border-line bg-ink-2">
        <ul className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p) => (
            <li key={p.title}>
              <h2 className="h-display text-base text-brass">{p.title}</h2>
              <p className="mt-1.5 text-sm text-bone-dim">{p.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------- BEST SELLER ---------------------------- */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Le più pescose</p>
              <h2 className="h-display mt-2 text-3xl sm:text-4xl">Best seller</h2>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-brass hover:underline">
              Vedi tutto il catalogo →
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------- CATEGORIE ----------------------------- */}
      <section className="border-y border-line bg-ink-2">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <p className="eyebrow">Il catalogo</p>
          <h2 className="h-display mt-2 text-3xl sm:text-4xl">Scegli la famiglia</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?categoria=${c.slug}`}
                className="group rounded-lg border border-line p-5 transition-colors hover:border-brass/60"
              >
                <h3 className="h-display text-xl group-hover:text-brass">{c.name}</h3>
                <p className="mt-1.5 text-sm text-bone-dim">{c.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- LABORATORIO --------------------------- */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          {novita.slice(0, 4).map((p, i) => (
            <div key={p.id} className={`rounded-lg border border-line bg-ink-2 p-4 ${i % 2 ? "mt-6" : ""}`}>
              <LureArt palette={p.variants[0]?.palette} uid={p.id} className="w-full" />
            </div>
          ))}
        </div>
        <div>
          <p className="eyebrow">Il laboratorio</p>
          <h2 className="h-display mt-2 text-3xl sm:text-4xl">Due giorni di lavoro per ogni esca</h2>
          <p className="mt-5 leading-relaxed text-bone-dim">
            Partiamo da uno stampo in silicone e da una resina bicomponente. Dopo la colata l&apos;esca viene
            carteggiata a mano, zavorrata, verniciata con aerografo e protetta da tre mani di resina UV.
            Solo alla fine arrivano occhielli in acciaio inox e ancorette.
          </p>
          <p className="mt-4 leading-relaxed text-bone-dim">
            È un processo lento e per questo produciamo poco: quando una colorazione finisce, torna
            disponibile solo alla serie successiva.
          </p>
          <Link
            href="/chi-siamo"
            className="mt-7 inline-block rounded-md border border-line px-6 py-3 font-semibold transition-colors hover:border-brass hover:text-brass"
          >
            La nostra storia
          </Link>
        </div>
      </section>

      {/* ---------------------------- RECENSIONI ---------------------------- */}
      <section className="border-t border-line bg-ink-2">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <p className="eyebrow">Dicono di noi</p>
          <h2 className="h-display mt-2 text-3xl sm:text-4xl">Chi le ha già provate</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <figure key={r.author} className="rounded-lg border border-line p-6">
                <div className="text-brass" aria-label="5 stelle su 5">
                  {"★".repeat(5)}
                </div>
                <blockquote className="mt-3 leading-relaxed text-bone-dim">“{r.text}”</blockquote>
                <figcaption className="mt-4 text-sm font-semibold">
                  {r.author} <span className="font-normal text-bone-dim">· {r.place}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
