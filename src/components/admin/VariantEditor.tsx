import { deleteVariant, saveVariant } from "@/app/admin/actions";
import LureArt, { parsePalette } from "@/components/LureArt";
import type { Variant } from "@/lib/db/schema";

type Props = { productId: string; kind: string; variants: Variant[] };

export default function VariantEditor({ productId, kind, variants }: Props) {
  return (
    <div className="space-y-4">
      {variants.map((v) => (
        <VariantRow key={v.id} productId={productId} kind={kind} variant={v} />
      ))}
      <VariantRow productId={productId} kind={kind} />
    </div>
  );
}

function VariantRow({ productId, kind, variant }: { productId: string; kind: string; variant?: Variant }) {
  const palette = parsePalette(variant?.palette ?? '["#5c7f96","#f2f2ef","#2b3f4d","#d94f2b"]');
  const isNew = !variant;

  return (
    <div className={`rounded-lg border p-4 ${isNew ? "border-dashed border-line" : "border-line bg-ink-2"}`}>
      {isNew && <p className="eyebrow mb-3">Aggiungi una colorazione</p>}

      <div className="flex flex-wrap gap-4">
        <div className="w-28 shrink-0 rounded border border-line bg-ink p-1.5">
          <LureArt palette={palette} kind={kind as never} uid={variant?.id ?? `new-${productId}`} className="w-full" />
        </div>

        <form action={saveVariant} className="min-w-0 flex-1 space-y-3">
          <input type="hidden" name="productId" value={productId} />
          {variant && <input type="hidden" name="id" value={variant.id} />}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Small label="Nome colorazione" name="name" defaultValue={variant?.name} required />
            <Small label="SKU" name="sku" defaultValue={variant?.sku} placeholder="auto" />
            <Small label="Giacenza" name="stock" defaultValue={variant?.stock ?? 0} />
            <Small
              label="Variazione prezzo (€)"
              name="priceDelta"
              defaultValue={variant ? (variant.priceDeltaCents / 100).toFixed(2) : "0.00"}
            />
          </div>

          <div className="flex flex-wrap items-end gap-3">
            {(["Dorso", "Ventre", "Ombra", "Dettaglio"] as const).map((label, i) => (
              <div key={label}>
                <label htmlFor={`${variant?.id ?? "new"}-color${i + 1}`} className="block text-xs text-bone-dim">
                  {label}
                </label>
                <input
                  id={`${variant?.id ?? "new"}-color${i + 1}`}
                  type="color"
                  name={`color${i + 1}`}
                  defaultValue={palette[i]}
                  className="mt-1 h-9 w-14 cursor-pointer rounded border border-line bg-ink"
                />
              </div>
            ))}

            <div className="min-w-48 flex-1">
              <Small
                label="URL foto (facoltativo)"
                name="imageUrl"
                defaultValue={variant?.imageUrl}
                placeholder="https://…"
              />
            </div>

            <label className="flex items-center gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                name="active"
                defaultChecked={variant ? variant.active : true}
                className="h-4 w-4 accent-[var(--color-brass)]"
              />
              Attiva
            </label>

            <input type="hidden" name="sort" value={variant?.sort ?? 99} />

            <button type="submit" className="rounded-md bg-brass px-4 py-2 text-sm font-bold text-ink">
              {isNew ? "Aggiungi" : "Salva"}
            </button>
          </div>
        </form>

        {variant && (
          <form action={deleteVariant} className="self-start">
            <input type="hidden" name="id" value={variant.id} />
            <input type="hidden" name="productId" value={productId} />
            <button type="submit" className="text-sm text-bone-dim underline hover:text-rust">
              Elimina
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Small({
  label,
  name,
  defaultValue,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-bone-dim">{label}</span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="mt-1 w-full rounded-md border border-line bg-ink px-2.5 py-2 text-sm"
      />
    </label>
  );
}
