import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { MapPin, Star, ArrowRight, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import AdPlaceholder from "@/components/AdPlaceholder";
import SEOHead from "@/components/SEOHead";
import SaunaFAQ from "@/components/SaunaFAQ";
import { supabase } from "@/integrations/supabase/client";
import { PROVINCES } from "@/lib/provinces";
import SafeSaunaMap from "@/components/SafeSaunaMap";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PlaatsPage = () => {
  const { provincie, plaatsnaam } = useParams<{ provincie: string; plaatsnaam: string }>();
  const province = PROVINCES.find((p) => p.slug === provincie);

  const { data: saunas, isLoading } = useQuery({
    queryKey: ["saunas-plaats", provincie, plaatsnaam],
    queryFn: async () => {
      const { data } = await supabase
        .from("saunas")
        .select("id, name, slug, address, average_rating, review_count, photo_urls, plaatsnaam, plaatsnaam_slug, provincie_slug, lat, lng, description, website")
        .eq("provincie_slug", provincie!)
        .eq("plaatsnaam_slug", plaatsnaam!)
        .order("name");
      return data || [];
    },
    enabled: !!provincie && !!plaatsnaam,
  });

  // Fetch other cities in same province for internal linking
  const { data: otherCities } = useQuery({
    queryKey: ["other-cities", provincie, plaatsnaam],
    queryFn: async () => {
      const { data } = await supabase
        .from("saunas")
        .select("plaatsnaam, plaatsnaam_slug")
        .eq("provincie_slug", provincie!)
        .neq("plaatsnaam_slug", plaatsnaam!);
      if (!data) return [];
      const unique = new Map<string, { plaatsnaam: string; plaatsnaam_slug: string }>();
      data.forEach((s) => unique.set(s.plaatsnaam_slug, s));
      return Array.from(unique.values()).sort((a, b) => a.plaatsnaam.localeCompare(b.plaatsnaam));
    },
    enabled: !!provincie && !!plaatsnaam,
  });

  const displayPlaats = saunas?.[0]?.plaatsnaam || plaatsnaam;

  const saunasForMap = useMemo(() => {
    if (!saunas) return [];
    return saunas.filter((s) => s.lat != null && s.lng != null);
  }, [saunas]);

  const avgRating = useMemo(() => {
    if (!saunas || saunas.length === 0) return 0;
    const rated = saunas.filter((s) => s.average_rating && Number(s.average_rating) > 0);
    if (rated.length === 0) return 0;
    return rated.reduce((sum, s) => sum + Number(s.average_rating), 0) / rated.length;
  }, [saunas]);

  const faqItems = [
    {
      q: `Hoeveel sauna's zijn er in ${displayPlaats}?`,
      a: `Er ${saunas?.length === 1 ? "is" : "zijn"} momenteel ${saunas?.length || 0} sauna${saunas?.length === 1 ? "" : "'s"} en wellness ${saunas?.length === 1 ? "centrum" : "centra"} geregistreerd in ${displayPlaats}. Bekijk het volledige overzicht op deze pagina.`,
    },
    {
      q: `Wat is de best beoordeelde sauna in ${displayPlaats}?`,
      a: saunas && saunas.length > 0
        ? `De best beoordeelde sauna in ${displayPlaats} is ${[...saunas].sort((a, b) => Number(b.average_rating || 0) - Number(a.average_rating || 0))[0]?.name}. Vergelijk alle beoordelingen en kies de sauna die het beste bij jou past.`
        : `Er zijn nog geen beoordelingen beschikbaar voor sauna's in ${displayPlaats}.`,
    },
    {
      q: `Kan ik een sauna boeken in ${displayPlaats}?`,
      a: `Ja, via Saunaboeken.com kun je eenvoudig een sauna boeken in ${displayPlaats}. Klik op de sauna van je keuze om meer informatie te bekijken en direct te boeken via de website van de sauna.`,
    },
    {
      q: `Welke wellness faciliteiten zijn er in ${displayPlaats}?`,
      a: `De sauna's en wellness centra in ${displayPlaats} bieden diverse faciliteiten zoals Finse sauna's, stoomcabines, infraroodcabines, zwembaden en diverse behandelingen. Bekijk de individuele sauna's voor specifieke faciliteiten.`,
    },
    {
      q: `Zijn er sauna's met buitenfaciliteiten in ${displayPlaats}?`,
      a: `Veel sauna's in ${displayPlaats} en omgeving bieden buitenfaciliteiten zoals buitenzwembaden, buitensauna's en tuinen. Bekijk de detailpagina van elke sauna voor meer informatie.`,
    },
  ];

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
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  ];

  return (
    <div className="container py-10">
      <SEOHead
        title={`Sauna boeken ${displayPlaats} — De beste sauna's | Saunaboeken.com`}
        description={`Sauna boeken in ${displayPlaats}? Ontdek alle ${saunas?.length || ""} sauna's en wellness centra. Vergelijk reviews, foto's en boek direct jouw sauna in ${displayPlaats}, ${province?.name || provincie}.`}
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

      <h1 className="mb-2 font-serif text-3xl font-bold md:text-4xl">Sauna boeken in {displayPlaats}</h1>
      <p className="mb-4 text-lg text-muted-foreground max-w-3xl">
        Wil je een sauna boeken in {displayPlaats}? Ontdek de beste sauna's en wellness centra in {displayPlaats}, {province?.name || provincie}. 
        Vergelijk beoordelingen, bekijk foto's en boek direct de ideale sauna voor een ontspannende dag.
      </p>

      {/* Quick stats */}
      {saunas && saunas.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-primary" />
            {saunas.length} sauna{saunas.length !== 1 && "'s"}
          </div>
          {avgRating > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium">
              <Star className="h-4 w-4 text-warm-gold fill-current" />
              Gem. {avgRating.toFixed(1)} / 5
            </div>
          )}
        </div>
      )}

      <AdPlaceholder className="mb-8" />

      {/* SEO intro text */}
      <section className="mb-8 prose prose-sm max-w-none text-muted-foreground">
        <h2 className="font-serif text-xl font-semibold text-foreground">De beste sauna's in {displayPlaats}</h2>
        <p>
          {displayPlaats} heeft een uitstekend aanbod aan sauna's en wellness centra voor ieder budget en elke smaak. 
          Of je nu op zoek bent naar een luxe dagje wellness, een romantische sauna voor twee, of een sportieve sauna 
          na het sporten — in {displayPlaats} vind je het. Op deze pagina vergelijk je alle sauna's in {displayPlaats} 
          op basis van beoordelingen, faciliteiten en locatie.
        </p>
        <div className="not-prose grid gap-3 sm:grid-cols-2 mt-4 mb-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <span className="text-sm">Vergelijk alle sauna's op één plek</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <span className="text-sm">Bekijk echte reviews van bezoekers</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <span className="text-sm">Vind de sauna die bij jou past</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <span className="text-sm">Boek direct via de website van de sauna</span>
          </div>
        </div>
      </section>

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
              <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg h-full">
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
          <p className="text-muted-foreground">Geen sauna's gevonden in {displayPlaats}.</p>
        </div>
      )}

      {/* FAQ section */}
      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif text-2xl font-bold mb-4">Veelgestelde vragen over sauna's in {displayPlaats}</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left font-medium">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Other cities in province */}
      {otherCities && otherCities.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-serif text-xl font-semibold mb-4">
            Sauna boeken in andere plaatsen in {province?.name || provincie}
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherCities.slice(0, 20).map((city) => (
              <Link
                key={city.plaatsnaam_slug}
                to={`/sauna/${provincie}/${city.plaatsnaam_slug}`}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {city.plaatsnaam}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Link back to province */}
      <div className="mt-10 border-t border-border pt-6">
        <Link to={`/sauna/${provincie}`} className="text-sm text-primary hover:underline">
          ← Bekijk alle sauna's in {province?.name || provincie}
        </Link>
      </div>

      {/* Bottom SEO text */}
      <section className="mt-8 prose prose-sm max-w-none text-muted-foreground">
        <h2 className="font-serif text-lg font-semibold text-foreground">Waarom een sauna boeken in {displayPlaats}?</h2>
        <p>
          Een bezoek aan een sauna in {displayPlaats} is de perfecte manier om te ontspannen en tot rust te komen. 
          De sauna's in {displayPlaats} bieden een breed scala aan faciliteiten, van traditionele Finse sauna's 
          tot moderne wellness centra met zwembaden, stoomcabines en diverse behandelingen. Of je nu alleen komt, 
          met je partner of met vrienden — er is altijd een sauna in {displayPlaats} die bij je past.
        </p>
        <p>
          Via Saunaboeken.com vergelijk je eenvoudig alle sauna's in{" "}
          <Link to={`/sauna/${provincie}/${plaatsnaam}`} className="text-primary hover:underline">{displayPlaats}</Link> en de rest van{" "}
          <Link to={`/sauna/${provincie}`} className="text-primary hover:underline">{province?.name || provincie}</Link>. 
          Bekijk ook onze{" "}
          <Link to="/de-beste-saunas-van-nederland" className="text-primary hover:underline">Top 10 beste sauna's van Nederland</Link> 
          {" "}of gebruik de{" "}
          <Link to="/kaart" className="text-primary hover:underline">saunakaart</Link> om een sauna in de buurt te vinden.
        </p>
      </section>

      <AdPlaceholder className="mt-8" />
    </div>
  );
};

export default PlaatsPage;
