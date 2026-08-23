import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategories, listProducts } from "@/lib/catalog";
import { ACTION_LABELS } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description: "Tutte le esche artigianali, gli accessori e l'abbigliamento GASS Lures.",
};

const SORTS = [
  { value: "", label: "Consigliati" },
  { value: "novita", label: "Novità" },
  { value: "prezzo-asc", label: "Prezzo crescente" },
  { value: "prezzo-desc", label: "Prezzo decrescente" },
  { value: "nome", label: "Nome A-Z" },
] as const;

type SearchParams = Promise<{ categoria?: string; azione?: string; ordina?: string }>;

/** Costruisce l'URL dei filtri conservando quelli già attivi. */
function href(current: Record<string, string | undefined>, patch: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...current, ...patch })) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const current = { categoria: sp.categoria, azione: sp.azione, ordina: sp.ordina };

  const [categories, items] = await Promise.all([
    getCategories(),
    listProducts({
      categorySlug: sp.categoria ?? null,
      action: sp.azione ?? null,
      sort: (sp.ordina as "novita" | "prezzo-asc" | "prezzo-desc" | "nome" | undefined) ?? null,
    }),
  ]);

  const activeCategory = categories.find((c) => c.slug === sp.categoria);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="eyebrow">Catalogo</p>
      <h1 className="h-display mt-2 text-4xl sm:text-5xl">{activeCategory ? activeCategory.name : "Tutti i prodotti"}</h1>
      <p className="mt-3 max-w-2xl text-bone-dim">
        {activeCategory?.description ??
          "Esche rigide costruite a mano, accessori di ricambio e abbigliamento. Produzione limitata: le quantità indicate sono quelle realmente disponibili."}
      </p>

      {/* Filtri: link puri, funzionano anche senza JavaScript */}
      <div className="mt-8 space-y-4 border-y border-line py-5">
        <Filters label="Categoria">
          <Chip href={href(current, { categoria: undefined })} active={!sp.categoria}>Tutte</Chip>
          {categories.map((c) => (
            <Chip key={c.id} href={href(current, { categoria: c.slug })} active={sp.categoria === c.slug}>
              {c.name}
            </Chip>
          ))}
        </Filters>

        <Filters label="Assetto">
          <Chip href={href(current, { azione: undefined })} active={!sp.azione}>Tutti</Chip>
          {["floating", "suspending", "sinking"].map((a) => (
            <Chip key={a} href={href(current, { azione: a })} active={sp.azione === a}>
              {ACTION_LABELS[a]}
            </Chip>
          ))}
        </Filters>

        <Filters label="Ordina per">
          {SORTS.map((s) => (
            <Chip key={s.value} href={href(current, { ordina: s.value || undefined })} active={(sp.ordina ?? "") === s.value}>
              {s.label}
            </Chip>
          ))}
        </Filters>
      </div>

      <p className="mt-6 text-sm text-bone-dim">
        {items.length} {items.length === 1 ? "prodotto" : "prodotti"}
      </p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-lg border border-line bg-ink-2 p-10 text-center">
          <p className="h-display text-2xl">Nessun prodotto con questi filtri</p>
          <p className="mt-2 text-bone-dim">Prova a togliere qualche filtro o torna al catalogo completo.</p>
          <Link href="/shop" className="mt-6 inline-block rounded-md bg-brass px-6 py-3 font-bold text-ink">
            Vedi tutto
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function Filters({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="eyebrow mr-1 w-24 shrink-0">{label}</span>
      {children}
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active ? "border-brass bg-brass text-ink font-semibold" : "border-line text-bone-dim hover:border-brass hover:text-bone"
      }`}
    >
      {children}
    </Link>
  );
}
