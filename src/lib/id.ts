import { randomBytes, randomUUID } from "crypto";

export function newId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

export function newToken(bytes = 16) {
  return randomBytes(bytes).toString("hex");
}

/** Numero ordine leggibile: GL-250823-4F7A */
export function newOrderNumber(date = new Date()) {
  const y = String(date.getFullYear()).slice(2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `GL-${y}${m}${d}-${randomBytes(2).toString("hex").toUpperCase()}`;
}
