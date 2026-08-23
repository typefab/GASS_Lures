import LureArt from "./LureArt";

/**
 * Immagine di una colorazione: la foto reale se c'è, altrimenti
 * l'illustrazione generata dai colori. Un solo punto di decisione, così
 * catalogo, carrello e cassa mostrano sempre la stessa cosa.
 */
export default function VariantThumb({
  imageUrl,
  palette,
  kind,
  uid,
  alt,
  className,
}: {
  imageUrl?: string | null;
  palette?: string | string[] | null;
  kind?: string;
  uid: string;
  alt: string;
  className?: string;
}) {
  if (imageUrl) {
    // Le foto dei prodotti sono file statici nostri: non serve l'ottimizzatore.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={alt} className={className} loading="lazy" decoding="async" />;
  }
  return <LureArt palette={palette} kind={kind as never} uid={uid} className={className} />;
}
