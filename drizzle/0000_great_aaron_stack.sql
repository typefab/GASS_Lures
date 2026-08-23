CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text DEFAULT '' NOT NULL,
	`body` text NOT NULL,
	`handled` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `newsletter` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_email_unique` ON `newsletter` (`email`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`variant_id` text,
	`product_slug` text DEFAULT '' NOT NULL,
	`product_name` text NOT NULL,
	`variant_name` text DEFAULT '' NOT NULL,
	`sku` text DEFAULT '' NOT NULL,
	`unit_price_cents` integer NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`email` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`address1` text NOT NULL,
	`address2` text DEFAULT '' NOT NULL,
	`city` text NOT NULL,
	`zip` text NOT NULL,
	`province` text DEFAULT '' NOT NULL,
	`country` text DEFAULT 'IT' NOT NULL,
	`shipping_zone` text DEFAULT 'IT' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`subtotal_cents` integer NOT NULL,
	`shipping_cents` integer NOT NULL,
	`total_cents` integer NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`payment_provider` text DEFAULT 'demo' NOT NULL,
	`payment_ref` text DEFAULT '' NOT NULL,
	`public_token` text NOT NULL,
	`tracking_code` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`paid_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_number_unique` ON `orders` (`number`);--> statement-breakpoint
CREATE INDEX `orders_created_idx` ON `orders` (`created_at`);--> statement-breakpoint
CREATE INDEX `orders_email_idx` ON `orders` (`email`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`category_id` text,
	`tagline` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`price_cents` integer NOT NULL,
	`compare_at_cents` integer,
	`length_mm` integer,
	`weight_dg` integer,
	`action` text DEFAULT 'floating' NOT NULL,
	`depth_m` text DEFAULT '' NOT NULL,
	`hooks` text DEFAULT '' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_idx` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `products_cat_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE TABLE `variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`sku` text NOT NULL,
	`price_delta_cents` integer DEFAULT 0 NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`palette` text DEFAULT '[]' NOT NULL,
	`image_url` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `variants_sku_idx` ON `variants` (`sku`);--> statement-breakpoint
CREATE INDEX `variants_product_idx` ON `variants` (`product_id`);