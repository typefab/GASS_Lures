import type { MetadataRoute } from "next";
import { allProductSlugs, getCategories } from "@/lib/catalog";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, categories] = await Promise.all([allProductSlugs(), getCategories()]);
  const now = new Date();

  const staticPages = ["", "/shop", "/chi-siamo", "/contatti", "/spedizioni-e-resi", "/termini", "/privacy"];

  return [
    ...staticPages.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      priority: path === "" ? 1 : 0.7,
    })),
    ...categories.map((c) => ({
      url: `${base}/shop?categoria=${c.slug}`,
      lastModified: now,
      priority: 0.6,
    })),
    ...slugs.map((p) => ({
      url: `${base}/prodotti/${p.slug}`,
      lastModified: now,
      priority: 0.8,
    })),
  ];
}
