/**
 * Illustrazione vettoriale di un'esca, generata dalla palette della variante.
 * Serve come immagine segnaposto finché non carichi le foto reali dei prodotti:
 * appena `imageUrl` è valorizzato, il sito mostra la foto al posto del disegno.
 *
 * palette = [dorso, ventre, ombra, dettaglio]
 */

type Kind = "minnow" | "stickbait" | "jerkbait" | "micro" | "accessori" | "merch";

const FALLBACK: [string, string, string, string] = ["#5c7f96", "#f2f2ef", "#2b3f4d", "#d94f2b"];

export function parsePalette(raw: string | string[] | null | undefined): [string, string, string, string] {
  let arr: unknown = raw;
  if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw);
    } catch {
      arr = null;
    }
  }
  if (!Array.isArray(arr) || arr.length < 4) return FALLBACK;
  return [String(arr[0]), String(arr[1]), String(arr[2]), String(arr[3])];
}

/** Hash stabile: stessa variante = stesso disegno, su server e su client. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function kindFromCategory(slug: string | null | undefined): Kind {
  switch (slug) {
    case "stickbait":
    case "jerkbait":
    case "micro":
    case "accessori":
    case "merch":
      return slug;
    default:
      return "minnow";
  }
}

type Props = {
  palette: string | string[] | null | undefined;
  kind?: Kind;
  uid: string;
  className?: string;
  /** Titolo accessibile; se assente l'illustrazione è puramente decorativa. */
  label?: string;
};

export default function LureArt({ palette, kind = "minnow", uid, className, label }: Props) {
  const [back, belly, shadow, accent] = parsePalette(palette);
  const id = `la${hash(uid + kind).toString(36)}`;
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const };

  return (
    <svg viewBox="0 0 420 200" className={className} {...a11y}>
      <defs>
        <linearGradient id={`${id}-back`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shadow} />
          <stop offset="55%" stopColor={back} />
          <stop offset="100%" stopColor={back} />
        </linearGradient>
        <linearGradient id={`${id}-belly`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={belly} stopOpacity="0.85" />
          <stop offset="100%" stopColor={belly} />
        </linearGradient>
        <linearGradient id={`${id}-gloss`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {kind === "merch" ? (
        <Merch id={id} back={back} accent={accent} />
      ) : kind === "accessori" ? (
        <Accessori id={id} back={back} accent={accent} shadow={shadow} />
      ) : (
        <Lure id={id} kind={kind} accent={accent} shadow={shadow} />
      )}
    </svg>
  );
}

/* --------------------------------- esche ---------------------------------- */

const BODIES: Record<string, { path: string; lip: boolean; eye: [number, number]; hooks: number[] }> = {
  // corpo panciuto con paletta
  minnow: {
    path:
      "M78 100 C 96 66 150 50 232 52 C 292 54 322 66 344 80 L 392 52 L 380 100 L 392 148 L 344 120 C 322 134 292 146 232 148 C 150 150 96 134 78 100 Z",
    lip: true,
    eye: [110, 90],
    hooks: [160, 262],
  },
  // profilo affusolato senza paletta
  stickbait: {
    path:
      "M74 100 C 92 74 152 60 236 62 C 296 64 326 74 348 86 L 394 58 L 384 100 L 394 142 L 348 114 C 326 126 296 136 236 138 C 152 140 92 126 74 100 Z",
    lip: false,
    eye: [106, 92],
    hooks: [166, 268],
  },
  // slim, spalla alta
  jerkbait: {
    path:
      "M80 100 C 94 70 148 56 230 58 C 290 60 320 72 342 84 L 390 56 L 380 100 L 390 144 L 342 116 C 320 128 290 140 230 142 C 148 144 94 130 80 100 Z",
    lip: true,
    eye: [110, 90],
    hooks: [162, 264],
  },
  micro: {
    path:
      "M110 100 C 124 76 168 64 232 66 C 282 68 306 78 324 88 L 366 64 L 358 100 L 366 136 L 324 112 C 306 122 282 132 232 134 C 168 136 124 124 110 100 Z",
    lip: true,
    eye: [136, 92],
    hooks: [186, 268],
  },
};

function Lure({ id, kind, accent, shadow }: { id: string; kind: Kind; accent: string; shadow: string }) {
  const body = BODIES[kind] ?? BODIES.minnow;
  const [ex, ey] = body.eye;

  return (
    <g>
      {/* ancorette dietro al corpo */}
      {body.hooks.map((x) => (
        <Treble key={x} x={x} y={kind === "micro" ? 128 : 140} scale={kind === "micro" ? 0.72 : 1} />
      ))}

      {/* occhiello di attacco */}
      <circle cx={body.lip ? 80 : 74} cy="100" r="6" fill="none" stroke="#9aa3a8" strokeWidth="3" />

      {/* paletta */}
      {body.lip && (
        <g>
          <path d="M84 108 L 44 150 L 30 138 L 74 96 Z" fill="#c9d4d9" fillOpacity="0.55" stroke="#8e9ba1" strokeWidth="2" />
          <path d="M84 108 L 44 150" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" />
        </g>
      )}

      <clipPath id={`${id}-clip`}>
        <path d={body.path} />
      </clipPath>

      {/* corpo */}
      <path d={body.path} fill={`url(#${id}-back)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <path d="M0 104 C 120 128 300 128 420 104 L 420 200 L 0 200 Z" fill={`url(#${id}-belly)`} />
        {/* linea laterale */}
        <path d="M0 104 C 120 128 300 128 420 104" stroke={shadow} strokeOpacity="0.5" strokeWidth="2" fill="none" />
        {/* scaglie */}
        <g stroke="#000" strokeOpacity="0.09" fill="none" strokeWidth="1.5">
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M${120 + i * 26} 46 C ${128 + i * 26} 100 ${128 + i * 26} 100 ${120 + i * 26} 156`} />
          ))}
        </g>
        {/* branchia */}
        <path d="M132 56 C 118 84 118 116 132 146" stroke={shadow} strokeOpacity="0.55" strokeWidth="3" fill="none" />
        {/* riflesso */}
        <path d={body.path} fill={`url(#${id}-gloss)`} />
      </g>
      <path d={body.path} fill="none" stroke="#000" strokeOpacity="0.28" strokeWidth="2" />

      {/* occhio */}
      <circle cx={ex} cy={ey} r="11" fill="#f7f5ef" />
      <circle cx={ex} cy={ey} r="11" fill="none" stroke={accent} strokeWidth="2.5" />
      <circle cx={ex} cy={ey} r="5" fill="#101010" />
      <circle cx={ex - 3} cy={ey - 3} r="2" fill="#ffffff" fillOpacity="0.9" />
    </g>
  );
}

function Treble({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke="#aab3b8" strokeWidth="3" fill="none" strokeLinecap="round">
      <circle cx="0" cy="0" r="6" />
      <path d="M0 6 L 0 26" />
      <path d="M0 26 C -14 26 -18 40 -8 44 C -2 46 -2 38 -6 38" />
      <path d="M0 26 C 14 26 18 40 8 44 C 2 46 2 38 6 38" />
      <path d="M0 26 L 0 48 C 0 54 -6 54 -6 48" />
    </g>
  );
}

/* ------------------------------- accessori -------------------------------- */

function Accessori({ id, back, accent, shadow }: { id: string; back: string; accent: string; shadow: string }) {
  return (
    <g>
      <rect x="96" y="52" width="228" height="96" rx="10" fill={`url(#${id}-back)`} stroke={shadow} strokeWidth="2" />
      <rect x="96" y="52" width="228" height="96" rx="10" fill={`url(#${id}-gloss)`} />
      {Array.from({ length: 4 }, (_, i) => (
        <line key={i} x1={96 + (i + 1) * 45.6} y1="52" x2={96 + (i + 1) * 45.6} y2="148" stroke={shadow} strokeOpacity="0.4" strokeWidth="2" />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <Treble key={i} x={118 + i * 45.6} y={74} scale={0.55} />
      ))}
      <rect x="96" y="52" width="228" height="20" fill={accent} fillOpacity="0.85" />
      <rect x="96" y="52" width="228" height="96" rx="10" fill="none" stroke={back} strokeOpacity="0.5" strokeWidth="2" />
    </g>
  );
}

/* --------------------------------- merch ---------------------------------- */

function Merch({ id, back, accent }: { id: string; back: string; accent: string }) {
  return (
    <g>
      <path
        d="M150 46 L 120 60 L 96 92 L 122 112 L 134 98 L 134 168 L 286 168 L 286 98 L 298 112 L 324 92 L 300 60 L 270 46 C 258 66 162 66 150 46 Z"
        fill={`url(#${id}-back)`}
        stroke="#000"
        strokeOpacity="0.3"
        strokeWidth="2"
      />
      <path d="M150 46 C 162 78 258 78 270 46 C 250 52 170 52 150 46 Z" fill="#000" fillOpacity="0.25" />
      <path
        d="M150 46 L 120 60 L 96 92 L 122 112 L 134 98 L 134 168 L 286 168 L 286 98 L 298 112 L 324 92 L 300 60 L 270 46"
        fill={`url(#${id}-gloss)`}
        stroke="none"
      />
      <rect x="182" y="112" width="56" height="10" rx="2" fill={accent} />
      <rect x="182" y="128" width="34" height="6" rx="2" fill={accent} fillOpacity="0.6" />
      <path d="M210 168 L 210 98" stroke={back} strokeOpacity="0.001" />
    </g>
  );
}
