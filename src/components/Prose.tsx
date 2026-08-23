export default function Prose({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="h-display text-4xl sm:text-5xl">{title}</h1>
      {updated && <p className="mt-2 text-sm text-bone-dim">Ultimo aggiornamento: {updated}</p>}
      <div className="mt-8 space-y-6 leading-relaxed text-bone-dim [&_a]:text-brass [&_a]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-bone [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-bone [&_ul]:space-y-2">
        {children}
      </div>
    </div>
  );
}

/** Segnaposto per i dati legali che devi inserire prima di vendere davvero. */
export function ToDo({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded bg-brass/20 px-1.5 py-0.5 font-semibold text-brass-soft">[{children}]</mark>
  );
}
