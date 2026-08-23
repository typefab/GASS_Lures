import { db } from "./index";
import { categories, products, variants } from "./schema";

/**
 * Catalogo iniziale del negozio.
 * Viene caricato dal comando `npm run db:seed` e, automaticamente, la prima
 * volta che il sito parte su un database ancora vuoto.
 */
type SeedVariant = { name: string; palette: string[]; stock?: number; image?: string };
type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  priceCents: number;
  compareAtCents?: number;
  lengthMm?: number;
  weightDg?: number;
  action?: string;
  depthM?: string;
  hooks?: string;
  featured?: boolean;
  variants: SeedVariant[];
};

const SEED_CATEGORIES = [
  { slug: "minnow", name: "Minnow", description: "Esche rigide con paletta, il pane quotidiano dello spinning.", sort: 1 },
  { slug: "stickbait", name: "Stickbait", description: "Senza paletta: azione erratica in superficie e sottopelle.", sort: 2 },
  { slug: "jerkbait", name: "Jerkbait", description: "Profili slim per animazioni nervose e recuperi a scatti.", sort: 3 },
  { slug: "micro", name: "Micro esche", description: "Taglie sotto i 6 cm per persici, cavedani e trote.", sort: 4 },
  { slug: "accessori", name: "Accessori", description: "Ricambi e componenti per tenere le esche sempre in pesca.", sort: 5 },
  { slug: "merch", name: "Abbigliamento", description: "Capi GASS Lures per stare comodi in riva.", sort: 6 },
];

const P = {
  perch: ["#3d5a2a", "#e8dfae", "#1c2a14", "#f4b400"],
  ayu: ["#5c7f96", "#f2f2ef", "#2b3f4d", "#d94f2b"],
  firetiger: ["#2f6b1f", "#f5a623", "#101a0c", "#e02020"],
  chartreuse: ["#b5d334", "#f7f7dd", "#4a5c12", "#e02020"],
  wakasagi: ["#7d8a99", "#ececec", "#3a4450", "#101010"],
  bloodRed: ["#8c1f1f", "#e6d2c0", "#3d0d0d", "#f4b400"],
  ghost: ["#c9c4bb", "#fbfbf8", "#8b8579", "#2b2b2b"],
  matteBlack: ["#1e1e1e", "#3a3a3a", "#0a0a0a", "#c8a24a"],
  goldTrout: ["#a9772f", "#f0e0c0", "#5b3d12", "#2b2b2b"],
  bleak: ["#9fb6c4", "#fdfdfd", "#5a6d7a", "#1a1a1a"],
  copper: ["#a45c2b", "#efd7b8", "#5c2f11", "#1a1a1a"],
  nightBlue: ["#1f3a63", "#dfe8f2", "#0c1a2e", "#e8c33a"],
  navy: ["#1b2a41", "#1b2a41", "#1b2a41", "#c8a24a"],
  sand: ["#d9cbb2", "#d9cbb2", "#d9cbb2", "#2b2b2b"],
  olive: ["#4b5320", "#4b5320", "#4b5320", "#e8dfae"],
  steel: ["#8d8d8d", "#c9c9c9", "#5c5c5c", "#2b2b2b"],

  // Colorazioni Spear Jerk 100 — [dorso, ventre, ombra, dettaglio]
  sjGoldAyu: ["#7a6a24", "#e9cf72", "#2b2410", "#d0392b"],
  sjBrownTrout: ["#6d5a2f", "#e3d47a", "#2a2113", "#c2352f"],
  sjRainbowTrout: ["#7c8f3f", "#efe0e6", "#2f3a18", "#e07a9a"],
  sjChromeOrange: ["#2b2f33", "#dfe3e6", "#0e1113", "#e2661d"],
  sjBlueBars: ["#2f9ad6", "#e8eef2", "#12405e", "#1c6fa0"],
  sjPurpleSpot: ["#5b2f9c", "#ded4ee", "#241143", "#8a3fd0"],
};

const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "ghisa-90",
    name: "Ghisa 90",
    category: "minnow",
    tagline: "Minnow galleggiante da 9 cm per acque medie",
    description:
      "Ghisa 90 è il minnow di casa: corpo in resina colata a mano, camera di zavorra fissa e paletta inclinata che lavora fra 40 e 120 cm. Nato sui canali di pianura, dove serve un'esca che tenga la corrente senza uscire dall'asse. La finitura è verniciata a mano e protetta da tre mani di resina UV.\n\nOgni esca viene collaudata in vasca prima della spedizione: se non nuota, non esce dal laboratorio.",
    priceCents: 2800,
    lengthMm: 90,
    weightDg: 110,
    action: "floating",
    depthM: "0,4 - 1,2 m",
    hooks: "2 ancorette inox #6",
    featured: true,
    variants: [
      { name: "Perch", palette: P.perch, stock: 12 },
      { name: "Ayu", palette: P.ayu, stock: 8 },
      { name: "Fire Tiger", palette: P.firetiger, stock: 6 },
      { name: "Ghost", palette: P.ghost, stock: 4 },
    ],
  },
  {
    slug: "ghisa-110",
    name: "Ghisa 110",
    category: "minnow",
    tagline: "La sorella maggiore, sospensiva",
    description:
      "Undici centimetri di minnow sospensivo, pensato per lucci e grossi cavedani. La zavorra mobile aiuta il lancio contro vento e blocca l'esca in assetto neutro alla sosta: il momento in cui arrivano quasi tutti gli attacchi.\n\nCostruzione in resina bicomponente, occhielli passanti in acciaio inox 316 e ancorette rinforzate.",
    priceCents: 3000,
    lengthMm: 110,
    weightDg: 165,
    action: "suspending",
    depthM: "0,8 - 1,8 m",
    hooks: "2 ancorette inox #4",
    featured: true,
    variants: [
      { name: "Wakasagi", palette: P.wakasagi, stock: 9 },
      { name: "Fire Tiger", palette: P.firetiger, stock: 5 },
      { name: "Blood Red", palette: P.bloodRed, stock: 3 },
    ],
  },
  {
    slug: "spear-jerk-100",
    name: "Spear Jerk 100",
    category: "jerkbait",
    tagline: "Jerkbait slim da 10 cm, sei colorazioni",
    description:
      "Spear Jerk 100 ha un profilo affilato: dieci centimetri di corpo sottile, testa cromata e paletta corta, per un'esca che taglia l'acqua e risponde a ogni colpo di cima.\n\nSei colorazioni disponibili, dalle livree naturali di trota fario, iridea e ayu alle tinte ad alto contrasto per l'acqua torbida o le giornate cupe.\n\n[Da completare: descrizione costruttiva, assetto reale, profondità di lavoro e armamento.]",
    priceCents: 2900,
    lengthMm: 100,
    action: "suspending",
    featured: true,
    variants: [
      { name: "Gold Ayu", palette: P.sjGoldAyu, stock: 6, image: "/prodotti/spear-jerk-100-gold-ayu.png" },
      { name: "Brown Trout", palette: P.sjBrownTrout, stock: 6, image: "/prodotti/spear-jerk-100-brown-trout.png" },
      { name: "Rainbow Trout", palette: P.sjRainbowTrout, stock: 6, image: "/prodotti/spear-jerk-100-rainbow-trout.png" },
      { name: "Chrome Orange", palette: P.sjChromeOrange, stock: 6, image: "/prodotti/spear-jerk-100-chrome-orange.png" },
      { name: "Blue Bars", palette: P.sjBlueBars, stock: 6, image: "/prodotti/spear-jerk-100-blue-bars.png" },
      { name: "Purple Spot", palette: P.sjPurpleSpot, stock: 6, image: "/prodotti/spear-jerk-100-purple-spot.png" },
    ],
  },
  {
    slug: "darsena-105",
    name: "Darsena 105",
    category: "stickbait",
    tagline: "Stickbait affondante ad azione erratica",
    description:
      "Nessuna paletta, nessuna regola: Darsena 105 scende lentamente con un movimento a foglia morta e, in recupero, disegna una S larga. Perfetto sui bassi fondali di lago all'alba.\n\nDensità calibrata per una discesa di circa 20 cm al secondo.",
    priceCents: 2900,
    lengthMm: 105,
    weightDg: 145,
    action: "sinking",
    depthM: "0 - 2,5 m",
    hooks: "2 ancorette inox #6",
    variants: [
      { name: "Ayu", palette: P.ayu, stock: 10 },
      { name: "Matte Black", palette: P.matteBlack, stock: 5 },
      { name: "Night Blue", palette: P.nightBlue, stock: 5 },
    ],
  },
  {
    slug: "alborella-45",
    name: "Alborella 45",
    category: "micro",
    tagline: "Micro minnow da 4,5 cm",
    description:
      "Costruita sul profilo dell'alborella, è l'esca giusta quando il pesce è selettivo e si nutre di avannotto. Nonostante i 3,2 grammi si lancia bene grazie alla zavorra concentrata nella coda.\n\nMontata con ancorette #12 a filo sottile per non rovinare i pesci di taglia piccola.",
    priceCents: 2400,
    lengthMm: 45,
    weightDg: 32,
    action: "floating",
    depthM: "0,2 - 0,6 m",
    hooks: "2 ancorette inox #12",
    featured: true,
    variants: [
      { name: "Bleak", palette: P.bleak, stock: 18 },
      { name: "Perch", palette: P.perch, stock: 11 },
      { name: "Copper", palette: P.copper, stock: 9 },
    ],
  },
  {
    slug: "roggia-60",
    name: "Roggia 60",
    category: "micro",
    tagline: "Affondante compatto per acque veloci",
    description:
      "Sei centimetri e 6 grammi: Roggia 60 tiene la corrente delle rogge e dei torrenti senza salire in superficie. Recupero lineare o a piccoli scatti, funziona in entrambi i modi.\n\nVerniciatura opaca, meno riflessi nelle giornate di sole pieno.",
    priceCents: 2500,
    lengthMm: 60,
    weightDg: 60,
    action: "sinking",
    depthM: "0,5 - 1,5 m",
    hooks: "2 ancorette inox #10",
    variants: [
      { name: "Gold Trout", palette: P.goldTrout, stock: 13 },
      { name: "Olive", palette: P.olive, stock: 8 },
      { name: "Chartreuse", palette: P.chartreuse, stock: 0 },
    ],
  },
  {
    slug: "barbo-130",
    name: "Barbo 130",
    category: "minnow",
    tagline: "Big bait da 13 cm per predatori di taglia",
    description:
      "Il pezzo grosso della gamma. Tredici centimetri, 34 grammi, costruzione rinforzata con anima passante in acciaio: regge lucci e siluri di taglia senza cedimenti.\n\nProduzione limitata: ogni Barbo 130 richiede due giorni di lavorazione fra colata, carteggiatura e finitura.",
    priceCents: 3900,
    compareAtCents: 4500,
    lengthMm: 130,
    weightDg: 340,
    action: "floating",
    depthM: "0,6 - 1,6 m",
    hooks: "2 ancorette inox #2",
    variants: [
      { name: "Fire Tiger", palette: P.firetiger, stock: 4 },
      { name: "Perch", palette: P.perch, stock: 3 },
      { name: "Matte Black", palette: P.matteBlack, stock: 2 },
    ],
  },
  {
    slug: "piombi-adesivi",
    name: "Piombi adesivi (set da 20)",
    category: "accessori",
    tagline: "Per tarare assetto e profondità delle tue esche",
    description:
      "Set di 20 piombi adesivi da 0,3 a 1,5 g per rendere sospensiva un'esca galleggiante o correggere l'assetto dopo un cambio di ancorette. Adesivo resistente all'acqua dolce e salata.",
    priceCents: 790,
    action: "soft",
    variants: [{ name: "Set assortito", palette: P.steel, stock: 40 }],
  },
  {
    slug: "ancorette-inox",
    name: "Ancorette inox (10 pz)",
    category: "accessori",
    tagline: "Ricambi originali GASS Lures",
    description:
      "Le stesse ancorette che montiamo in laboratorio: acciaio inox ad alto tenore di carbonio, punte chimicamente affilate. Confezione da 10 pezzi.",
    priceCents: 950,
    action: "soft",
    variants: [
      { name: "Misura #6", palette: P.steel, stock: 30 },
      { name: "Misura #8", palette: P.steel, stock: 25 },
      { name: "Misura #10", palette: P.steel, stock: 22 },
    ],
  },
  {
    slug: "felpa-gass-lures",
    name: "Felpa GASS Lures",
    category: "merch",
    tagline: "Cotone pesante 320 g/m², stampa serigrafica",
    description:
      "Felpa con cappuccio in cotone pesante, taglio regolare, stampa serigrafica sul petto e logo ricamato sulla manica. Sta bene in riva e anche fuori.",
    priceCents: 4900,
    action: "merch",
    variants: [
      { name: "Navy · S", palette: P.navy, stock: 4 },
      { name: "Navy · M", palette: P.navy, stock: 6 },
      { name: "Navy · L", palette: P.navy, stock: 6 },
      { name: "Navy · XL", palette: P.navy, stock: 3 },
      { name: "Sabbia · M", palette: P.sand, stock: 5 },
      { name: "Sabbia · L", palette: P.sand, stock: 5 },
    ],
  },
  {
    slug: "cappellino-gass-lures",
    name: "Cappellino GASS Lures",
    category: "merch",
    tagline: "Visiera curva, chiusura regolabile",
    description:
      "Cappellino a 6 pannelli con logo ricamato sul fronte e chiusura metallica regolabile. Taglia unica.",
    priceCents: 2200,
    action: "merch",
    variants: [
      { name: "Oliva", palette: P.olive, stock: 12 },
      { name: "Nero", palette: P.matteBlack, stock: 10 },
    ],
  },
];

export type SeedResult = { categorie: number; prodotti: number; varianti: number };

/** Inserisce il catalogo. Con `replace` cancella prima quello esistente (non tocca gli ordini). */
export async function seedCatalog({ replace = false } = {}): Promise<SeedResult> {
  if (replace) {
    await db.delete(variants);
    await db.delete(products);
    await db.delete(categories);
  }

  const catIdBySlug = new Map<string, string>();
  for (const c of SEED_CATEGORIES) {
    const id = `cat_${c.slug}`;
    catIdBySlug.set(c.slug, id);
    await db.insert(categories).values({ id, ...c });
  }

  let pi = 0;
  for (const p of SEED_PRODUCTS) {
    const productId = `prd_${p.slug.replace(/-/g, "_")}`;
    await db.insert(products).values({
      id: productId,
      slug: p.slug,
      name: p.name,
      categoryId: catIdBySlug.get(p.category) ?? null,
      tagline: p.tagline,
      description: p.description,
      priceCents: p.priceCents,
      compareAtCents: p.compareAtCents ?? null,
      lengthMm: p.lengthMm ?? null,
      weightDg: p.weightDg ?? null,
      action: p.action ?? "floating",
      depthM: p.depthM ?? "",
      hooks: p.hooks ?? "",
      featured: p.featured ?? false,
      active: true,
      sort: pi++,
    });

    let vi = 0;
    for (const v of p.variants) {
      await db.insert(variants).values({
        id: `var_${p.slug.replace(/-/g, "_")}_${vi}`,
        productId,
        name: v.name,
        sku: `${p.slug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12)}-${String(vi + 1).padStart(2, "0")}`,
        priceDeltaCents: 0,
        stock: v.stock ?? 5,
        palette: JSON.stringify(v.palette),
        imageUrl: v.image ?? "",
        active: true,
        sort: vi,
      });
      vi++;
    }
  }

  return {
    categorie: SEED_CATEGORIES.length,
    prodotti: SEED_PRODUCTS.length,
    varianti: SEED_PRODUCTS.reduce((n, p) => n + p.variants.length, 0),
  };
}
