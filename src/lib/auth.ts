/**
 * Sessione dell'area amministrativa.
 * Un solo utente (il titolare del negozio): password nell'ambiente,
 * cookie firmato con HMAC-SHA256. Nessun dato sensibile nel cookie.
 */
export const COOKIE_NAME = "gass_admin";
export const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 ore

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    throw new Error(
      "AUTH_SECRET mancante o troppo corta: impostala nelle variabili d'ambiente (almeno 16 caratteri).",
    );
  }
  return value;
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
