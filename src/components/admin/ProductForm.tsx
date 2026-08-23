import { saveProduct } from "@/app/admin/actions";
import { ACTION_LABELS } from "@/lib/format";
import type { Category, Product } from "@/lib/db/schema";

type Props = { product?: Product; categories: Category[] };

export default function ProductForm({ product, categories }: Props) {
  const euro = (cents: number | null | undefined) =>
    cents === null || cents === undefined ? "" : (cents / 100).toFixed(2);

  return (
    <form action={saveProduct} className="space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" name="name" defaultValue={product?.name} required />
        <Field
          label="Indirizzo della pagina (slug)"
          name="slug"
          defaultValue={product?.slug}
          hint="Lascia vuoto per generarlo dal nome"
        />
        <Field label="Prezzo in euro" name="price" defaultValue={euro(product?.priceCents)} required placeholder="28,00" />
        <Field
          label="Prezzo barrato (promozioni)"
          name="compareAt"
          defaultValue={euro(product?.compareAtCents)}
          hint="Deve essere maggiore del prezzo, altrimenti viene ignorato"
        />

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium">
            Categoria
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={product?.categoryId ?? ""}
            className="mt-1.5 w-full rounded-md border border-line bg-ink-2 px-3 py-2.5 text-sm"
          >
            <option value="">— nessuna —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="action" className="block text-sm font-medium">
            Assetto / tipo
          </label>
          <select
            id="action"
            name="action"
            defaultValue={product?.action ?? "floating"}
            className="mt-1.5 w-full rounded-md border border-line bg-ink-2 px-3 py-2.5 text-sm"
          >
            {Object.entries(ACTION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <Field label="Lunghezza (mm)" name="lengthMm" defaultValue={product?.lengthMm ?? ""} placeholder="90" />
        <Field
          label="Peso (g)"
          name="weightG"
          defaultValue={product?.weightDg ? (product.weightDg / 10).toString() : ""}
          placeholder="11"
        />
        <Field label="Profondità di lavoro" name="depthM" defaultValue={product?.depthM} placeholder="0,4 - 1,2 m" />
        <Field label="Armamento" name="hooks" defaultValue={product?.hooks} placeholder="2 ancorette inox #6" />
        <Field label="Ordine di comparsa" name="sort" defaultValue={product?.sort ?? 0} />
      </div>

      <Field label="Sottotitolo" name="tagline" defaultValue={product?.tagline} full />

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Descrizione
        </label>
        <textarea
          id="description"
          name="description"
          rows={8}
          defaultValue={product?.description}
          className="mt-1.5 w-full rounded-md border border-line bg-ink-2 px-3 py-2.5 text-sm"
        />
        <p className="mt-1 text-xs text-bone-dim">Lascia una riga vuota fra un paragrafo e l&apos;altro.</p>
      </div>

      <div className="flex flex-wrap gap-6">
        <Checkbox label="Visibile sul sito" name="active" defaultChecked={product ? product.active : true} />
        <Checkbox label="In evidenza in home" name="featured" defaultChecked={product?.featured ?? false} />
      </div>

      <button type="submit" className="rounded-md bg-brass px-6 py-3 font-bold text-ink">
        {product ? "Salva modifiche" : "Crea prodotto"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  hint,
  full,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label htmlFor={name} className="block text-sm font-medium">
        {label} {required && <span className="text-brass">*</span>}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="mt-1.5 w-full rounded-md border border-line bg-ink-2 px-3 py-2.5 text-sm"
      />
      {hint && <p className="mt-1 text-xs text-bone-dim">{hint}</p>}
    </div>
  );
}

function Checkbox({ label, name, defaultChecked }: { label: string; name: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-[var(--color-brass)]" />
      {label}
    </label>
  );
}
