/**
 * Sessione dell'area amministrativa.
 * Un solo utente (il titolare del negozio): password nell'ambiente,
 * cookie firmato con HMAC-SHA256. Nessun dato sensibile nel cookie.
 */
export const COOKIE_NAME = "gass_admin";
export const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 ore

/**
 * Chiave usata per firmare il cookie di sessione.
 *
 * Se AUTH_SECRET non è impostata la ricaviamo dalla password di amministrazione:
 * così il sito funziona anche con la configurazione minima del primo deploy.
 * È una soluzione di ripiego — la sicurezza del cookie scende al livello della
 * password — quindi il pannello lo segnala e va sistemata prima di vendere.
 */
function secret() {
  const explicit = process.env.AUTH_SECRET;
  if (explicit && explicit.length >= 16) return explicit;

  const password = process.env.ADMIN_PASSWORD;
  if (password && password.length >= 8) return `gass-lures:chiave-derivata:${password}`;

  throw new Error(
    "AUTH_SECRET mancante: impostala nelle variabili d'ambiente (almeno 16 caratteri), " +
      "oppure imposta una ADMIN_PASSWORD di almeno 8 caratteri.",
  );
}

/** true quando la chiave di firma è ricavata dalla password invece che impostata a parte. */
export function isDerivedAuthSecret() {
  const explicit = process.env.AUTH_SECRET;
  return !(explicit && explicit.length >= 16);
}

function b64url(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return b64url(new Uint8Array(mac));
}

export async function createSessionToken() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = String(exp);
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;

  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  const expected = await sign(payload);
  if (!timingSafeEqual(signature, expected)) return false;

  const exp = Number(payload);
  return Number.isFinite(exp) && exp > Math.floor(Date.now() / 1000);
}

/** Confronto a tempo costante, per non rivelare la firma un carattere alla volta. */
function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Verifica la password di accesso senza rivelare nulla sui tempi di risposta. */
export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  const same = timingSafeEqual(padTo(input, 128), padTo(expected, 128));
  return same && input.length === expected.length;
}

function padTo(s: string, n: number) {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}
