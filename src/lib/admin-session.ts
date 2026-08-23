import "server-only";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "./auth";

export async function isAdmin() {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value).catch(() => false);
}

/**
 * Da chiamare all'inizio di ogni azione lato server dell'area admin.
 * Il middleware protegge già le pagine, ma le azioni vanno difese da sole.
 */
export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Accesso non autorizzato.");
}
