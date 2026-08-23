"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages, orders, products, variants } from "@/lib/db/schema";
import { COOKIE_NAME, MAX_AGE_SECONDS, checkPassword, createSessionToken } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-session";
import { newId } from "@/lib/id";
import { ORDER_STATUS_KEYS } from "@/lib/order-status";

/* ------------------------------ accesso ---------------------------------- */

export async function login(_prev: { error?: string } | null, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("da") ?? "/admin");

  if (!process.env.ADMIN_PASSWORD) {
    return { error: "ADMIN_PASSWORD non è configurata sul server." };
  }
  if (!checkPassword(password)) {
    // Piccolo ritardo: rende poco pratici i tentativi a raffica.
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Password errata." };
  }

  // Il flag `secure` segue il protocollo reale della richiesta: su HTTPS il
  // cookie è protetto, in HTTP (sviluppo o anteprima locale) resta utilizzabile.
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const store = await cookies();
  store.set(COOKIE_NAME, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  redirect("/admin/login");
}

/* ------------------------------- ordini ---------------------------------- */

export async function updateOrder(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const trackingCode = String(formData.get("trackingCode") ?? "").trim();

  if (!id || !ORDER_STATUS_KEYS.includes(status)) throw new Error("Stato ordine non valido.");

  await db.update(orders).set({ status, trackingCode }).where(eq(orders.id, id));
  revalidatePath(`/admin/ordini/${id}`);
  revalidatePath("/admin/ordini");
  revalidatePath("/admin");
}

/* ------------------------------ prodotti --------------------------------- */

function num(value: FormDataEntryValue | null): number | null {
  const s = String(value ?? "").trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Converte "28,50" in 2850 centesimi. */
function euroToCents(value: FormDataEntryValue | null): number | null {
  const n = num(value);
  return n === null ? null : Math.round(n * 100);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Il nome del prodotto è obbligatorio.");

  const priceCents = euroToCents(formData.get("price"));
  if (priceCents === null || priceCents < 0) throw new Error("Prezzo non valido.");

  const compareRaw = euroToCents(formData.get("compareAt"));

  const values = {
    slug: slugify(String(formData.get("slug") ?? "") || name),
    name,
    categoryId: String(formData.get("categoryId") ?? "") || null,
    tagline: String(formData.get("tagline") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    priceCents,
    compareAtCents: compareRaw && compareRaw > priceCents ? compareRaw : null,
    lengthMm: num(formData.get("lengthMm")) !== null ? Math.round(num(formData.get("lengthMm"))!) : null,
    weightDg: num(formData.get("weightG")) !== null ? Math.round(num(formData.get("weightG"))! * 10) : null,
    action: String(formData.get("action") ?? "floating"),
    depthM: String(formData.get("depthM") ?? "").trim(),
    hooks: String(formData.get("hooks") ?? "").trim(),
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    sort: Math.round(num(formData.get("sort")) ?? 0),
  };

  let productId = id;
  if (id) {
    await db.update(products).set(values).where(eq(products.id, id));
  } else {
    productId = newId("prd");
    await db.insert(products).values({ id: productId, ...values });
  }

  revalidatePath("/admin/prodotti");
  revalidatePath(`/prodotti/${values.slug}`);
  revalidatePath("/shop");
  redirect(`/admin/prodotti/${productId}?salvato=1`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.delete(variants).where(eq(variants.productId, id));
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/prodotti");
  revalidatePath("/shop");
  redirect("/admin/prodotti");
}

/* ------------------------------ varianti --------------------------------- */

export async function saveVariant(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const productId = String(formData.get("productId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!productId || !name) throw new Error("Prodotto e nome della colorazione sono obbligatori.");

  const palette = [1, 2, 3, 4].map((n) => String(formData.get(`color${n}`) ?? "").trim() || "#888888");

  const values = {
    productId,
    name,
    sku: String(formData.get("sku") ?? "").trim() || `SKU-${Date.now().toString(36).toUpperCase()}`,
    priceDeltaCents: euroToCents(formData.get("priceDelta")) ?? 0,
    stock: Math.max(0, Math.round(num(formData.get("stock")) ?? 0)),
    palette: JSON.stringify(palette),
    imageUrl: String(formData.get("imageUrl") ?? "").trim(),
    active: formData.get("active") === "on",
    sort: Math.round(num(formData.get("sort")) ?? 0),
  };

  if (id) {
    await db.update(variants).set(values).where(eq(variants.id, id));
  } else {
    await db.insert(variants).values({ id: newId("var"), ...values });
  }

  revalidatePath(`/admin/prodotti/${productId}`);
  revalidatePath("/shop");
}

export async function deleteVariant(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!id) return;
  await db.delete(variants).where(eq(variants.id, id));
  revalidatePath(`/admin/prodotti/${productId}`);
  revalidatePath("/shop");
}

/* ------------------------------ messaggi --------------------------------- */

export async function toggleMessage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const handled = formData.get("handled") === "1";
  if (!id) return;
  await db.update(messages).set({ handled }).where(eq(messages.id, id));
  revalidatePath("/admin/messaggi");
}
