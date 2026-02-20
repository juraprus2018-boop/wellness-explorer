import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import AdPlaceholder from "@/components/AdPlaceholder";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { PROVINCES } from "@/lib/provinces";
import SafeSaunaMap from "@/components/SafeSaunaMap";

const PlaatsPage = () => {
  const { provincie, plaatsnaam } = useParams<{ provincie: string; plaatsnaam: string }>();
  const province = PROVINCES.find((p) => p.slug === provincie);

  const { data: saunas, isLoading } = useQuery({
    queryKey: ["saunas-plaats", provincie, plaatsnaam],
    queryFn: async () => {
      const { data } = await supabase
        .from("saunas")
        .select("id, name, slug, address, average_rating, review_count, photo_urls, plaatsnaam, plaatsnaam_slug, provincie_slug, lat, lng")
        .eq("provincie_slug", provincie!)
        .eq("plaatsnaam_slug", plaatsnaam!)
        .order("name");
      return data || [];
    },
    enabled: !!provincie && !!plaatsnaam,
  });

  const displayPlaats = saunas?.[0]?.plaatsnaam || plaatsnaam;

  const saunasForMap = useMemo(() => {
    if (!saunas) return [];
    return saunas.filter((s) => s.lat != null && s.lng != null);
  }, [saunas]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://saunaboeken.com/" },
        { "@type": "ListItem", position: 2, name: province?.name || provincie, item: `https://saunaboeken.com/sauna/${provincie}` },
        { "@type": "ListItem", position: 3, name: displayPlaats, item: `https://saunaboeken.com/sauna/${provincie}/${plaatsnaam}` },
      ],
    },
    ...(saunas && saunas.length > 0
      ? [{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Sauna's in ${displayPlaats}`,
          numberOfItems: saunas.length,
          itemListElement: saunas.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.name,
            url: `https://saunaboeken.com/sauna/${provincie}/${plaatsnaam}/${s.slug}`,
          })),
        }]
      : []),
  ];

  return (
    <div className="container py-10">
      <SEOHead
        title={`Sauna boeken ${displayPlaats} — Vind & boek een sauna | Saunaboeken.com`}
        description={`Sauna boeken in ${displayPlaats}? Bekijk alle ${saunas?.length || ""} sauna's en wellness centra. Vergelijk reviews, foto's en boek direct jouw sauna in ${displayPlaats}.`}
        canonical={`https://saunaboeken.com/sauna/${provincie}/${plaatsnaam}`}
        jsonLd={jsonLd}
      />

      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/sauna/${provincie}`} className="hover:text-primary">{province?.name || provincie}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{displayPlaats}</span>
      </nav>

      <h1 className="mb-2 font-serif text-3xl font-bold">Sauna boeken in {displayPlaats}</h1>
      <p className="mb-8 text-muted-foreground">
        Wil je een sauna boeken in {displayPlaats}? Ontdek alle sauna's en wellness centra in {displayPlaats}, {province?.name || provincie}. Vergelijk beoordelingen en boek direct de ideale sauna.
      </p>

      <AdPlaceholder className="mb-8" />

      {saunasForMap.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 font-serif text-xl font-semibold">Kaart van sauna's in {displayPlaats}</h2>
          <SafeSaunaMap saunas={saunasForMap} height="300px" />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : saunas && saunas.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saunas.map((sauna) => (
            <Link key={sauna.id} to={`/sauna/${provincie}/${plaatsnaam}/${sauna.slug}`}>
              <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
                <div className="aspect-[4/3] bg-muted">
                  {sauna.photo_urls && sauna.photo_urls[0] ? (
                    <img src={sauna.photo_urls[0]} alt={`${sauna.name} in ${displayPlaats}`} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <MapPin className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-serif font-semibold truncate">{sauna.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{sauna.address}</p>
                  <div className="mt-2 flex items-center justify-between">
                    {sauna.average_rating && Number(sauna.average_rating) > 0 ? (
                      <div className="flex items-center gap-1 text-warm-gold">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{Number(sauna.average_rating).toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({sauna.review_count})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Geen reviews</span>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">Geen sauna's gevonden in deze plaats.</p>
        </div>
      )}

      {/* Link back to province */}
      <div className="mt-10 border-t border-border pt-6">
        <Link to={`/sauna/${provincie}`} className="text-sm text-primary hover:underline">
          ← Bekijk alle sauna's in {province?.name || provincie}
        </Link>
      </div>

      <AdPlaceholder className="mt-8" />
    </div>
  );
};

export default PlaatsPage;
