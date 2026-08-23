/**
 * FILE GENERATO — non modificare a mano.
 * Prodotto da scripts/build-schema-sql.mjs a partire da drizzle/*.sql
 * Rigeneralo con: npm run db:generate
 */

export const SCHEMA_STATEMENTS: readonly string[] = [
  "CREATE TABLE IF NOT EXISTS `categories` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`slug` text NOT NULL,\n\t`name` text NOT NULL,\n\t`description` text DEFAULT '' NOT NULL,\n\t`sort` integer DEFAULT 0 NOT NULL\n)",
  "CREATE UNIQUE INDEX IF NOT EXISTS `categories_slug_unique` ON `categories` (`slug`)",
  "CREATE TABLE IF NOT EXISTS `messages` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`name` text NOT NULL,\n\t`email` text NOT NULL,\n\t`subject` text DEFAULT '' NOT NULL,\n\t`body` text NOT NULL,\n\t`handled` integer DEFAULT false NOT NULL,\n\t`created_at` integer DEFAULT (unixepoch()) NOT NULL\n)",
  "CREATE TABLE IF NOT EXISTS `newsletter` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`email` text NOT NULL,\n\t`created_at` integer DEFAULT (unixepoch()) NOT NULL\n)",
  "CREATE UNIQUE INDEX IF NOT EXISTS `newsletter_email_unique` ON `newsletter` (`email`)",
  "CREATE TABLE IF NOT EXISTS `order_items` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`order_id` text NOT NULL,\n\t`variant_id` text,\n\t`product_slug` text DEFAULT '' NOT NULL,\n\t`product_name` text NOT NULL,\n\t`variant_name` text DEFAULT '' NOT NULL,\n\t`sku` text DEFAULT '' NOT NULL,\n\t`unit_price_cents` integer NOT NULL,\n\t`quantity` integer NOT NULL,\n\tFOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade\n)",
  "CREATE INDEX IF NOT EXISTS `order_items_order_idx` ON `order_items` (`order_id`)",
  "CREATE TABLE IF NOT EXISTS `orders` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`number` text NOT NULL,\n\t`status` text DEFAULT 'pending' NOT NULL,\n\t`email` text NOT NULL,\n\t`first_name` text NOT NULL,\n\t`last_name` text NOT NULL,\n\t`phone` text DEFAULT '' NOT NULL,\n\t`address1` text NOT NULL,\n\t`address2` text DEFAULT '' NOT NULL,\n\t`city` text NOT NULL,\n\t`zip` text NOT NULL,\n\t`province` text DEFAULT '' NOT NULL,\n\t`country` text DEFAULT 'IT' NOT NULL,\n\t`shipping_zone` text DEFAULT 'IT' NOT NULL,\n\t`note` text DEFAULT '' NOT NULL,\n\t`subtotal_cents` integer NOT NULL,\n\t`shipping_cents` integer NOT NULL,\n\t`total_cents` integer NOT NULL,\n\t`currency` text DEFAULT 'EUR' NOT NULL,\n\t`payment_provider` text DEFAULT 'demo' NOT NULL,\n\t`payment_ref` text DEFAULT '' NOT NULL,\n\t`public_token` text NOT NULL,\n\t`tracking_code` text DEFAULT '' NOT NULL,\n\t`created_at` integer DEFAULT (unixepoch()) NOT NULL,\n\t`paid_at` integer\n)",
  "CREATE UNIQUE INDEX IF NOT EXISTS `orders_number_unique` ON `orders` (`number`)",
  "CREATE INDEX IF NOT EXISTS `orders_created_idx` ON `orders` (`created_at`)",
  "CREATE INDEX IF NOT EXISTS `orders_email_idx` ON `orders` (`email`)",
  "CREATE TABLE IF NOT EXISTS `products` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`slug` text NOT NULL,\n\t`name` text NOT NULL,\n\t`category_id` text,\n\t`tagline` text DEFAULT '' NOT NULL,\n\t`description` text DEFAULT '' NOT NULL,\n\t`price_cents` integer NOT NULL,\n\t`compare_at_cents` integer,\n\t`length_mm` integer,\n\t`weight_dg` integer,\n\t`action` text DEFAULT 'floating' NOT NULL,\n\t`depth_m` text DEFAULT '' NOT NULL,\n\t`hooks` text DEFAULT '' NOT NULL,\n\t`featured` integer DEFAULT false NOT NULL,\n\t`active` integer DEFAULT true NOT NULL,\n\t`sort` integer DEFAULT 0 NOT NULL,\n\t`created_at` integer DEFAULT (unixepoch()) NOT NULL,\n\tFOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action\n)",
  "CREATE UNIQUE INDEX IF NOT EXISTS `products_slug_idx` ON `products` (`slug`)",
  "CREATE INDEX IF NOT EXISTS `products_cat_idx` ON `products` (`category_id`)",
  "CREATE TABLE IF NOT EXISTS `variants` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`product_id` text NOT NULL,\n\t`name` text NOT NULL,\n\t`sku` text NOT NULL,\n\t`price_delta_cents` integer DEFAULT 0 NOT NULL,\n\t`stock` integer DEFAULT 0 NOT NULL,\n\t`palette` text DEFAULT '[]' NOT NULL,\n\t`image_url` text DEFAULT '' NOT NULL,\n\t`active` integer DEFAULT true NOT NULL,\n\t`sort` integer DEFAULT 0 NOT NULL,\n\tFOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade\n)",
  "CREATE UNIQUE INDEX IF NOT EXISTS `variants_sku_idx` ON `variants` (`sku`)",
  "CREATE INDEX IF NOT EXISTS `variants_product_idx` ON `variants` (`product_id`)",
];
