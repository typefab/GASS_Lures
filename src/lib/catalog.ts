import "server-only";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "./db";
import { categories, products, variants } from "./db/schema";

export type ProductWithVariants = Awaited<ReturnType<typeof getProductBySlug>>;

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.sort));
}

type ListOptions = {
  categorySlug?: string | null;
  action?: string | null;
  sort?: "novita" | "prezzo-asc" | "prezzo-desc" | "nome" | null;
  featuredOnly?: boolean;
  limit?: number;
};

/** Elenco prodotti attivi con la prima variante (usata per l'anteprima) e la giacenza totale. */
export async function listProducts(opts: ListOptions = {}) {
  const where = [eq(products.active, true)];

  if (opts.categorySlug) {
    const cat = await db.select().from(categories).where(eq(categories.slug, opts.categorySlug)).limit(1);
    if (!cat.length) return [];
    where.push(eq(products.categoryId, cat[0].id));
  }
  if (opts.action) where.push(eq(products.action, opts.action));
  if (opts.featuredOnly) where.push(eq(products.featured, true));

  const orderBy =
    opts.sort === "prezzo-asc"
      ? asc(products.priceCents)
      : opts.sort === "prezzo-desc"
        ? desc(products.priceCents)
        : opts.sort === "nome"
          ? asc(products.name)
          : opts.sort === "novita"
            ? desc(products.createdAt)
            : asc(products.sort);

  const rows = await db
    .select({
      product: products,
      categorySlug: categories.slug,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...where))
    .orderBy(orderBy)
    .limit(opts.limit ?? 200);

  if (!rows.length) return [];

  const ids = rows.map((r) => r.product.id);
  const vs = await db
    .select()
    .from(variants)
    .where(and(inArray(variants.productId, ids), eq(variants.active, true)))
    .orderBy(asc(variants.sort));

  return rows.map((r) => {
    const mine = vs.filter((v) => v.productId === r.product.id);
    return {
      ...r.product,
      categorySlug: r.categorySlug,
      categoryName: r.categoryName,
      variants: mine,
      stockTotal: mine.reduce((n, v) => n + v.stock, 0),
    };
  });
}

export async function getProductBySlug(slug: string) {
  const rows = await db
    .select({ product: products, categorySlug: categories.slug, categoryName: categories.name })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.active, true)))
    .limit(1);

  if (!rows.length) return null;

  const vs = await db
    .select()
    .from(variants)
    .where(and(eq(variants.productId, rows[0].product.id), eq(variants.active, true)))
    .orderBy(asc(variants.sort));

  return {
    ...rows[0].product,
    categorySlug: rows[0].categorySlug,
    categoryName: rows[0].categoryName,
    variants: vs,
    stockTotal: vs.reduce((n, v) => n + v.stock, 0),
  };
}

/** Prodotti della stessa categoria, escluso quello corrente. */
export async function getRelated(productId: string, categoryId: string | null, limit = 4) {
  const where = [eq(products.active, true), sql`${products.id} <> ${productId}`];
  if (categoryId) where.push(eq(products.categoryId, categoryId));

  const rows = await db
    .select({ product: products, categorySlug: categories.slug, categoryName: categories.name })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...where))
    .orderBy(asc(products.sort))
    .limit(limit);

  if (rows.length < limit) {
    const extra = await db
      .select({ product: products, categorySlug: categories.slug, categoryName: categories.name })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.active, true), sql`${products.id} <> ${productId}`))
      .orderBy(asc(products.sort))
      .limit(limit * 2);
    for (const e of extra) {
      if (rows.length >= limit) break;
      if (!rows.some((r) => r.product.id === e.product.id)) rows.push(e);
    }
  }

  const ids = rows.map((r) => r.product.id);
  const vs = ids.length
    ? await db.select().from(variants).where(and(inArray(variants.productId, ids), eq(variants.active, true))).orderBy(asc(variants.sort))
    : [];

  return rows.map((r) => {
    const mine = vs.filter((v) => v.productId === r.product.id);
    return {
      ...r.product,
      categorySlug: r.categorySlug,
      categoryName: r.categoryName,
      variants: mine,
      stockTotal: mine.reduce((n, v) => n + v.stock, 0),
    };
  });
}

export async function allProductSlugs() {
  return db.select({ slug: products.slug }).from(products).where(eq(products.active, true));
}
