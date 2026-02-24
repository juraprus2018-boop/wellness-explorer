import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600",
};

const SITE = "https://saunaboeken.com";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: saunas } = await supabase
    .from("saunas")
    .select("slug, plaatsnaam_slug, provincie_slug, updated_at")
    .order("updated_at", { ascending: false });

  const today = new Date().toISOString().split("T")[0];

  // Static pages
  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/de-beste-saunas-van-nederland", priority: "0.9", changefreq: "weekly" },
    { loc: "/kaart", priority: "0.8", changefreq: "weekly" },
    { loc: "/contact", priority: "0.4", changefreq: "monthly" },
  ];

  // Collect unique provinces and cities
  const provinces = new Map<string, string>();
  const cities = new Map<string, string>();

  (saunas || []).forEach((s) => {
    if (!provinces.has(s.provincie_slug)) {
      provinces.set(s.provincie_slug, s.updated_at);
    }
    const cityKey = `${s.provincie_slug}/${s.plaatsnaam_slug}`;
    if (!cities.has(cityKey)) {
      cities.set(cityKey, s.updated_at);
    }
  });

  let urls = "";

  // Static
  for (const p of staticPages) {
    urls += `  <url>
    <loc>${SITE}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>\n`;
  }

  // Province pages
  for (const [slug, updated] of provinces) {
    urls += `  <url>
    <loc>${SITE}/sauna/${slug}</loc>
    <lastmod>${updated.split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }

  // City pages
  for (const [path, updated] of cities) {
    urls += `  <url>
    <loc>${SITE}/sauna/${path}</loc>
    <lastmod>${updated.split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
  }

  // Sauna detail pages
  for (const s of saunas || []) {
    urls += `  <url>
    <loc>${SITE}/sauna/${s.provincie_slug}/${s.plaatsnaam_slug}/${s.slug}</loc>
    <lastmod>${s.updated_at.split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}</urlset>`;

  return new Response(xml, { headers: corsHeaders });
});
