import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://saunaboeken.com";

Deno.serve(async (_req: Request) => {
  if (_req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: saunas, error } = await supabase
      .from("saunas")
      .select("slug, plaatsnaam_slug, provincie_slug, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }

    const today = new Date().toISOString().split("T")[0];

    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/de-beste-saunas-van-nederland", priority: "0.9", changefreq: "weekly" },
      { loc: "/kaart", priority: "0.8", changefreq: "weekly" },
      { loc: "/contact", priority: "0.4", changefreq: "monthly" },
    ];

    const provinces = new Map<string, string>();
    const cities = new Map<string, string>();

    (saunas || []).forEach((s: any) => {
      if (!provinces.has(s.provincie_slug)) {
        provinces.set(s.provincie_slug, s.updated_at);
      }
      const cityKey = `${s.provincie_slug}/${s.plaatsnaam_slug}`;
      if (!cities.has(cityKey)) {
        cities.set(cityKey, s.updated_at);
      }
    });

    let urls = "";

    for (const p of staticPages) {
      urls += `  <url>\n    <loc>${SITE}${p.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
    }

    for (const [slug, updated] of provinces) {
      urls += `  <url>\n    <loc>${SITE}/saunas/${slug}</loc>\n    <lastmod>${updated.split("T")[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    for (const [path, updated] of cities) {
      urls += `  <url>\n    <loc>${SITE}/saunas/${path}</loc>\n    <lastmod>${updated.split("T")[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    for (const s of saunas || []) {
      urls += `  <url>\n    <loc>${SITE}/saunas/${(s as any).provincie_slug}/${(s as any).plaatsnaam_slug}/${(s as any).slug}</loc>\n    <lastmod>${(s as any).updated_at.split("T")[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return new Response(`Internal error: ${err}`, { status: 500 });
  }
});
