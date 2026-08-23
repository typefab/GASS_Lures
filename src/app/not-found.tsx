import Link from "next/link";
import LureArt from "@/components/LureArt";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <LureArt palette='["#5c7f96","#f2f2ef","#2b3f4d","#d94f2b"]' uid="404" className="mx-auto w-64" />
      <h1 className="h-display mt-8 text-4xl">Cappotto</h1>
      <p className="mt-3 text-bone-dim">
        Questa pagina non esiste (o non esiste più). Capita anche alle giornate di pesca migliori.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="rounded-md bg-brass px-6 py-3 font-bold text-ink">
          Torna alla home
        </Link>
        <Link href="/shop" className="rounded-md border border-line px-6 py-3 font-semibold hover:border-brass hover:text-brass">
          Vai al catalogo
        </Link>
      </div>
    </div>
  );
}
