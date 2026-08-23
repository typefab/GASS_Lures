#!/usr/bin/env python3
"""
Prepara le foto dei prodotti per il sito.

Le foto esportate da molti editor hanno lo sfondo trasparente "appiattito" in
una scacchiera bianca e grigia. Su un sito con fondo scuro quella scacchiera si
vede come un rettangolo attorno all'esca. Questo script la riconosce e la
sostituisce con vera trasparenza, salvando in PNG.

Uso:
    python3 scripts/prepara-foto.py origine.jpg destinazione.png

Come funziona: parte dai bordi dell'immagine e si espande solo attraverso i
pixel chiari e neutri (i quadretti della scacchiera). Così le parti chiare
dell'esca — ventre argentato, riflessi, occhio — restano intatte, perché non
sono collegate al bordo.
"""
import sys
from collections import deque

from PIL import Image

# Un pixel è "scacchiera" se è chiaro e PERFETTAMENTE neutro.
# Misurato sulle foto reali: lo sfondo alterna bianco (255) e grigio (199) con
# saturazione 0-1, mentre l'argento del corpo dell'esca sta fra 18 e 65. La
# soglia stretta è ciò che impedisce al riempimento di mangiarsi i fianchi.
MIN_LUMA = 185
MAX_SATURATION = 8      # differenza massima fra canale più alto e più basso
# I fori chiusi (es. l'anello del portaancoretta) non toccano il bordo:
# li ripuliamo solo se sono abbastanza grandi e contengono davvero i due toni.
MIN_HOLE_AREA = 120
# La compressione JPEG lascia pixel sparsi che sfuggono al riconoscimento:
# frammenti opachi più piccoli di così non fanno parte dell'esca.
MIN_SUBJECT_AREA = 200


def is_background(px):
    r, g, b = px[0], px[1], px[2]
    return min(r, g, b) >= MIN_LUMA and (max(r, g, b) - min(r, g, b)) <= MAX_SATURATION


def flood_from_borders(px, w, h, bg):
    """Marca lo sfondo raggiungibile dai bordi dell'immagine."""
    seen = bytearray(w * h)
    queue = deque()

    for x in range(w):
        for y in (0, h - 1):
            if bg[y * w + x] and not seen[y * w + x]:
                seen[y * w + x] = 1
                queue.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if bg[y * w + x] and not seen[y * w + x]:
                seen[y * w + x] = 1
                queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h:
                i = ny * w + nx
                if bg[i] and not seen[i]:
                    seen[i] = 1
                    queue.append((nx, ny))
    return seen


def clear_enclosed_holes(px, w, h, bg, seen):
    """Ripulisce le zone di scacchiera chiuse dentro l'esca (anelli, occhielli)."""
    cleared = 0
    for start in range(w * h):
        if not bg[start] or seen[start]:
            continue

        component = []
        queue = deque([start])
        seen[start] = 1
        has_white = has_grey = False

        while queue:
            i = queue.popleft()
            component.append(i)
            value = px[i][0]
            if value >= 244:
                has_white = True
            elif value <= 224:
                has_grey = True

            x, y = i % w, i // w
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h:
                    j = ny * w + nx
                    if bg[j] and not seen[j]:
                        seen[j] = 1
                        queue.append(j)

        # Solo i buchi grandi e con entrambi i toni sono scacchiera vera.
        # Un riflesso bianco dentro l'occhio non ha il grigio: resta al suo posto.
        if len(component) >= MIN_HOLE_AREA and has_white and has_grey:
            cleared += len(component)
        else:
            for i in component:
                bg[i] = 0
    return cleared


def remove_speckles(w, h, bg):
    """Elimina i frammenti opachi isolati: puntini di rumore, non parti dell'esca."""
    seen = bytearray(w * h)
    removed = 0

    for start in range(w * h):
        if bg[start] or seen[start]:
            continue

        component = []
        queue = deque([start])
        seen[start] = 1
        while queue:
            i = queue.popleft()
            component.append(i)
            x, y = i % w, i // w
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h:
                    j = ny * w + nx
                    if not bg[j] and not seen[j]:
                        seen[j] = 1
                        queue.append(j)

        if len(component) < MIN_SUBJECT_AREA:
            for i in component:
                bg[i] = 1
            removed += len(component)
    return removed


def prepara(src, dst):
    im = Image.open(src).convert("RGB")
    w, h = im.size
    px = list(im.getdata())  # noqa: legacy API, sufficiente per immagini di queste dimensioni

    bg = bytearray(1 if is_background(p) else 0 for p in px)
    seen = flood_from_borders(px, w, h, bg)
    holes = clear_enclosed_holes(px, w, h, bg, seen)
    speckles = remove_speckles(w, h, bg)

    out = Image.new("RGBA", (w, h))
    out.putdata([(p[0], p[1], p[2], 0 if bg[i] else 255) for i, p in enumerate(px)])

    # Ritaglio ai margini del soggetto, con un piccolo respiro attorno.
    box = out.getbbox()
    if box:
        pad = 6
        out = out.crop(
            (max(0, box[0] - pad), max(0, box[1] - pad), min(w, box[2] + pad), min(h, box[3] + pad))
        )

    out.save(dst, "PNG", optimize=True)

    trasparenti = sum(bg)
    print(
        f"{dst}  {out.size[0]}x{out.size[1]}  "
        f"sfondo rimosso {trasparenti * 100 // (w * h)}%  "
        f"(fori chiusi {holes} px, frammenti isolati {speckles} px)"
    )


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    prepara(sys.argv[1], sys.argv[2])
