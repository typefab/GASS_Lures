import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const now = sql`(unixepoch())`;

/** Categoria/modello di esca (RealDeal, Slim, ...). */
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  sort: integer("sort").notNull().default(0),
});

export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    categoryId: text("category_id").references(() => categories.id),
    tagline: text("tagline").notNull().default(""),
    description: text("description").notNull().default(""),
    /** Prezzo base in centesimi. */
    priceCents: integer("price_cents").notNull(),
    /** Prezzo barrato (per i saldi), in centesimi. */
    compareAtCents: integer("compare_at_cents"),
    lengthMm: integer("length_mm"),
    weightDg: integer("weight_dg"), // decigrammi: 145 = 14,5 g
    /** floating | sinking | suspending | soft | merch */
    action: text("action").notNull().default("floating"),
    depthM: text("depth_m").notNull().default(""),
    hooks: text("hooks").notNull().default(""),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    sort: integer("sort").notNull().default(0),
    createdAt: integer("created_at").notNull().default(now),
  },
  (t) => [uniqueIndex("products_slug_idx").on(t.slug), index("products_cat_idx").on(t.categoryId)],
);

/** Colorazione di un'esca: è l'unità realmente acquistabile (ha SKU e giacenza). */
export const variants = sqliteTable(
  "variants",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sku: text("sku").notNull(),
    /** Differenza di prezzo rispetto al prodotto, in centesimi (di solito 0). */
    priceDeltaCents: integer("price_delta_cents").notNull().default(0),
    stock: integer("stock").notNull().default(0),
    /** Palette JSON usata per generare l'illustrazione dell'esca. */
    palette: text("palette").notNull().default("[]"),
    /** URL immagine reale; se vuoto viene disegnata l'illustrazione vettoriale. */
    imageUrl: text("image_url").notNull().default(""),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    sort: integer("sort").notNull().default(0),
  },
  (t) => [uniqueIndex("variants_sku_idx").on(t.sku), index("variants_product_idx").on(t.productId)],
);

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    number: text("number").notNull().unique(),
    /** pending | paid | shipped | delivered | cancelled | refunded */
    status: text("status").notNull().default("pending"),
    email: text("email").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text("phone").notNull().default(""),
    address1: text("address1").notNull(),
    address2: text("address2").notNull().default(""),
    city: text("city").notNull(),
    zip: text("zip").notNull(),
    province: text("province").notNull().default(""),
    country: text("country").notNull().default("IT"),
    shippingZone: text("shipping_zone").notNull().default("IT"),
    note: text("note").notNull().default(""),
    subtotalCents: integer("subtotal_cents").notNull(),
    shippingCents: integer("shipping_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    currency: text("currency").notNull().default("EUR"),
    /** stripe | demo */
    paymentProvider: text("payment_provider").notNull().default("demo"),
    paymentRef: text("payment_ref").notNull().default(""),
    /** Token pubblico per consultare l'ordine senza account. */
    publicToken: text("public_token").notNull(),
    trackingCode: text("tracking_code").notNull().default(""),
    createdAt: integer("created_at").notNull().default(now),
    paidAt: integer("paid_at"),
  },
  (t) => [index("orders_created_idx").on(t.createdAt), index("orders_email_idx").on(t.email)],
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: text("variant_id"),
    productSlug: text("product_slug").notNull().default(""),
    productName: text("product_name").notNull(),
    variantName: text("variant_name").notNull().default(""),
    sku: text("sku").notNull().default(""),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

export const newsletter = sqliteTable("newsletter", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at").notNull().default(now),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull().default(""),
  body: text("body").notNull(),
  handled: integer("handled", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull().default(now),
});

export type Product = typeof products.$inferSelect;
export type Variant = typeof variants.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
