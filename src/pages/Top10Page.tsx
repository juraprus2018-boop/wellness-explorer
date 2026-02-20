import { Link } from "react-router-dom";
import { Star, Trophy, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import AdPlaceholder from "@/components/AdPlaceholder";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";

const Top10Page = () => {
  const { data: top10, isLoading } = useQuery({
    queryKey: ["top10"],
    queryFn: async () => {
      const { data } = await supabase
        .from("saunas")
        .select("id, name, slug, plaatsnaam, plaatsnaam_slug, provincie_slug, provincie, average_rating, review_count, photo_urls, top10_position, description")
        .not("top10_position", "is", null)
        .order("top10_position", { ascending: true })
        .limit(10);
      return data || [];
    },
  });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://saunaboeken.com/" },
        { "@type": "ListItem", position: 2, name: "Top 10 Sauna's", item: "https://saunaboeken.com/de-beste-saunas-van-nederland" },
      ],
    },
    ...(top10 && top10.length > 0
      ? [{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "De 10 beste sauna's van Nederland",
          description: "Ranglijst van de best beoordeelde sauna's en wellness centra in Nederland.",
          numberOfItems: top10.length,
          itemListElement: top10.map((s) => ({
            "@type": "ListItem",
            position: s.top10_position,
            name: s.name,
            url: `https://saunaboeken.com/sauna/${s.provincie_slug}/${s.plaatsnaam_slug}/${s.slug}`,
          })),
        }]
      : []),
  ];

  return (
    <div className="container py-10">
      <SEOHead
        title="Top 10 beste sauna's om te boeken in Nederland 2025 | Saunaboeken.com"
        description="Sauna boeken? Ontdek de 10 best beoordeelde sauna's van Nederland. Vergelijk reviews, bekijk foto's en boek direct de beste sauna."
        canonical="https://saunaboeken.com/de-beste-saunas-van-nederland"
        jsonLd={jsonLd}
      />

      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">De beste sauna's van Nederland</span>
      </nav>

      <div className="mb-10 text-center">
        <Trophy className="mx-auto mb-4 h-12 w-12 text-warm-gold" />
        <h1 className="font-serif text-4xl font-bold">De 10 beste sauna's om te boeken in Nederland</h1>
        <p className="mt-3 mx-auto max-w-2xl text-muted-foreground">
          Welke sauna moet je boeken? Onze top 10 is gebaseerd op beoordelingen en reviews van echte bezoekers. Ontdek de best beoordeelde sauna's en boek direct.
        </p>
      </div>

      <AdPlaceholder className="mb-8" />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : top10 && top10.length > 0 ? (
        <div className="space-y-4">
          {top10.map((sauna, i) => (
            <div key={sauna.id}>
              <Link to={`/sauna/${sauna.provincie_slug}/${sauna.plaatsnaam_slug}/${sauna.slug}`}>
                <Card className="transition-all hover:shadow-lg">
                  <CardContent className="flex items-center gap-4 p-4 md:p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-xl font-bold text-primary">
                      {sauna.top10_position}
                    </div>
                    {sauna.photo_urls && sauna.photo_urls[0] ? (
                      <div className="hidden sm:block h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                        <img src={sauna.photo_urls[0]} alt={`${sauna.name} — nummer ${sauna.top10_position} sauna van Nederland`} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-serif text-lg font-semibold truncate">{sauna.top10_position}. {sauna.name}</h2>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {sauna.plaatsnaam}, {sauna.provincie}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-warm-gold shrink-0">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-medium">
                        {sauna.average_rating && Number(sauna.average_rating) > 0
                          ? Number(sauna.average_rating).toFixed(1)
                          : "—"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              {(i === 2 || i === 6) && <AdPlaceholder className="my-4" />}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            De top 10 is nog niet samengesteld. Kom binnenkort terug!
          </p>
        </div>
      )}

      {/* SEO text */}
      <section className="mt-12 mx-auto max-w-3xl text-sm text-muted-foreground space-y-3">
        <h2 className="font-serif text-xl font-bold text-foreground">Hoe kiezen wij de beste sauna's?</h2>
        <p>
          De ranglijst is gebaseerd op het gemiddelde van alle beoordelingen door bezoekers. We nemen alleen sauna's op die voldoende reviews hebben ontvangen om een betrouwbaar beeld te geven.
        </p>
        <p>
          Bekijk ook sauna's per provincie, zoals in <Link to="/sauna/noord-brabant" className="text-primary hover:underline">Noord-Brabant</Link>,{" "}
          <Link to="/sauna/utrecht" className="text-primary hover:underline">Utrecht</Link> of{" "}
          <Link to="/sauna/zuid-holland" className="text-primary hover:underline">Zuid-Holland</Link>. Of gebruik de{" "}
          <Link to="/kaart" className="text-primary hover:underline">interactieve kaart</Link> om sauna's bij jou in de buurt te vinden.
        </p>
      </section>

      <AdPlaceholder className="mt-8" />
    </div>
  );
};

export default Top10Page;
