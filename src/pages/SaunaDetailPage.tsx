import { useParams, Link } from "react-router-dom";
import { MapPin, Phone, Globe, Star, ArrowRight, Navigation } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import AdPlaceholder from "@/components/AdPlaceholder";
import ReviewForm from "@/components/ReviewForm";
import SEOHead from "@/components/SEOHead";
import SafeSaunaMap from "@/components/SafeSaunaMap";
import SaunaOpeningHours from "@/components/SaunaOpeningHours";
import SaunaFAQ from "@/components/SaunaFAQ";
import { supabase } from "@/integrations/supabase/client";
import { PROVINCES } from "@/lib/provinces";

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const SaunaDetailPage = () => {
  const { provincie, plaatsnaam, slug } = useParams<{
    provincie: string;
    plaatsnaam: string;
    slug: string;
  }>();
  const province = PROVINCES.find((p) => p.slug === provincie);

  const { data: sauna, isLoading } = useQuery({
    queryKey: ["sauna-detail", provincie, plaatsnaam, slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("saunas")
        .select("*")
        .eq("provincie_slug", provincie!)
        .eq("plaatsnaam_slug", plaatsnaam!)
        .eq("slug", slug!)
        .maybeSingle();
      return data;
    },
    enabled: !!provincie && !!plaatsnaam && !!slug,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", sauna?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("sauna_id", sauna!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!sauna?.id,
  });

  // Fetch ALL saunas with coordinates for distance-based nearby
  const { data: allSaunasRaw } = useQuery({
    queryKey: ["all-saunas-coords"],
    queryFn: async () => {
      const { data } = await supabase
        .from("saunas")
        .select("id, name, slug, average_rating, review_count, photo_urls, plaatsnaam, plaatsnaam_slug, provincie_slug, lat, lng, address")
        .not("lat", "is", null)
        .not("lng", "is", null);
      return data || [];
    },
    enabled: !!sauna?.id && !!sauna?.lat && !!sauna?.lng,
  });

  const nearbySaunas = useMemo(() => {
    if (!allSaunasRaw || !sauna?.lat || !sauna?.lng) return [];
    return allSaunasRaw
      .filter((s) => s.id !== sauna.id)
      .map((s) => ({
        ...s,
        distance: haversineDistance(sauna.lat!, sauna.lng!, s.lat!, s.lng!),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);
  }, [allSaunasRaw, sauna]);

  // Fallback nearby for saunas without coords
  const { data: nearbySaunasFallback } = useQuery({
    queryKey: ["nearby-saunas-fallback", provincie, plaatsnaam, sauna?.id],
    queryFn: async () => {
      const { data: sameProvince } = await supabase
        .from("saunas")
        .select("id, name, slug, average_rating, review_count, photo_urls, plaatsnaam, plaatsnaam_slug, provincie_slug, lat, lng, address")
        .eq("provincie_slug", provincie!)
        .neq("id", sauna!.id)
        .limit(6);
      return sameProvince || [];
    },
    enabled: !!sauna?.id && (!sauna?.lat || !sauna?.lng),
  });

  const displayNearby = nearbySaunas.length > 0 ? nearbySaunas : nearbySaunasFallback || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!sauna) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-serif text-3xl font-bold">Sauna niet gevonden</h1>
        <p className="mt-2 text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">Terug naar home</Link>
        </p>
      </div>
    );
  }

  const openingHours = sauna.opening_hours as string[] | null;
  const rating = sauna.average_rating != null ? Number(sauna.average_rating) : 0;

  const saunasForMap = sauna.lat && sauna.lng
    ? [{ id: sauna.id, name: sauna.name, lat: sauna.lat, lng: sauna.lng, slug: sauna.slug, plaatsnaam_slug: plaatsnaam!, provincie_slug: provincie! }]
    : [];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://saunaboeken.com/" },
        { "@type": "ListItem", position: 2, name: province?.name || provincie, item: `https://saunaboeken.com/saunas/${provincie}` },
        { "@type": "ListItem", position: 3, name: sauna.plaatsnaam, item: `https://saunaboeken.com/saunas/${provincie}/${plaatsnaam}` },
        { "@type": "ListItem", position: 4, name: sauna.name, item: `https://saunaboeken.com/saunas/${provincie}/${plaatsnaam}/${slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "HealthAndBeautyBusiness",
      name: sauna.name,
      description: sauna.description || `${sauna.name} is een sauna en wellness centrum in ${sauna.plaatsnaam}, ${sauna.provincie}. Boek nu je saunabezoek.`,
      url: `https://saunaboeken.com/saunas/${provincie}/${plaatsnaam}/${slug}`,
      ...(sauna.website && { sameAs: sauna.website }),
      address: {
        "@type": "PostalAddress",
        addressLocality: sauna.plaatsnaam,
        addressRegion: sauna.provincie,
        addressCountry: "NL",
        ...(sauna.address && { streetAddress: sauna.address }),
      },
      ...(sauna.phone && { telephone: sauna.phone }),
      ...(sauna.photo_urls && sauna.photo_urls[0] && { image: sauna.photo_urls[0] }),
      ...(rating > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating.toFixed(1),
          bestRating: "5",
          worstRating: "1",
          reviewCount: sauna.review_count || 1,
        },
      }),
      ...(sauna.lat && sauna.lng && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: sauna.lat,
          longitude: sauna.lng,
        },
      }),
    },
  ];

  return (
    <>
      <SEOHead
        title={`${sauna.name} boeken — Sauna in ${sauna.plaatsnaam} | Saunaboeken.com`}
        description={sauna.description ? sauna.description.substring(0, 155) : `${sauna.name} boeken in ${sauna.plaatsnaam}, ${sauna.provincie}. Bekijk reviews, openingstijden, foto's en boek direct.`}
        canonical={`https://saunaboeken.com/saunas/${provincie}/${plaatsnaam}/${slug}`}
        jsonLd={jsonLd}
      />

      {/* Full-width hero banner */}
      {sauna.photo_urls && sauna.photo_urls.length > 0 ? (
        <div className="relative w-full overflow-hidden">
          <Carousel className="w-full">
            <CarouselContent className="-ml-0">
              {sauna.photo_urls.map((url, i) => (
                <CarouselItem key={i} className="pl-0">
                  <div className="relative h-[35vh] sm:h-[45vh] md:h-[55vh] w-full">
                    <img
                      src={url}
                      alt={`${sauna.name} — foto ${i + 1}`}
                      className="h-full w-full object-cover"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-foreground/10" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {sauna.photo_urls.length > 1 && (
              <>
                <CarouselPrevious className="left-4 z-10 bg-background/80 border-none hover:bg-background" />
                <CarouselNext className="right-4 z-10 bg-background/80 border-none hover:bg-background" />
              </>
            )}
          </Carousel>
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-10">
            <div className="container">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                {sauna.name}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-white/85 text-sm sm:text-base drop-shadow">
                <MapPin className="h-4 w-4 shrink-0" />
                {sauna.plaatsnaam}, {sauna.provincie}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-[30vh] w-full bg-muted flex items-center justify-center overflow-hidden">
          <MapPin className="h-12 w-12 text-muted-foreground/30" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-10 bg-gradient-to-t from-foreground/40 to-transparent">
            <div className="container">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                {sauna.name}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-white/85 text-sm">
                <MapPin className="h-4 w-4 shrink-0" />
                {sauna.plaatsnaam}, {sauna.provincie}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="container py-8 overflow-x-hidden">
        <nav className="mb-6 text-sm text-muted-foreground flex flex-wrap gap-1">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to={`/saunas/${provincie}`} className="hover:text-primary">{province?.name || provincie}</Link>
          <span>/</span>
          <Link to={`/saunas/${provincie}/${plaatsnaam}`} className="hover:text-primary">{sauna.plaatsnaam}</Link>
          <span>/</span>
          <span className="text-foreground">{sauna.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {/* Quick info row */}
            <div className="flex flex-wrap gap-3">
              {rating > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium">
                  <Star className="h-4 w-4 text-warm-gold fill-current" />
                  {rating.toFixed(1)} / 5
                  <span className="text-muted-foreground">({sauna.review_count} reviews)</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{sauna.address || `${sauna.plaatsnaam}, ${sauna.provincie}`}</span>
              </div>
              {sauna.phone && (
                <a href={`tel:${sauna.phone}`} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm hover:bg-primary/10 transition-colors">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  {sauna.phone}
                </a>
              )}
            </div>

            {/* CTA */}
            {sauna.website && (
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <a href={sauna.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" /> Sauna boeken
                </a>
              </Button>
            )}

            {/* Description */}
            {sauna.description && (
              <Card>
                <CardHeader><CardTitle className="font-serif">Over {sauna.name}</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground leading-relaxed">{sauna.description}</p></CardContent>
              </Card>
            )}

            {/* Opening hours */}
            <Card>
              <CardContent className="p-5">
                <SaunaOpeningHours openingHours={openingHours} />
              </CardContent>
            </Card>

            {/* Map */}
            {saunasForMap.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="font-serif text-lg">Locatie</CardTitle></CardHeader>
                <CardContent>
                  <SafeSaunaMap saunas={saunasForMap} height="300px" className="rounded-lg overflow-hidden" />
                  {sauna.address && (
                    <p className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" /> {sauna.address}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <AdPlaceholder sectionKey="detail_mid" />

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">
                  Reviews {reviews && reviews.length > 0 && `(${reviews.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{review.reviewer_name}</p>
                          <div className="flex items-center gap-1 text-warm-gold">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-muted"}`} />
                            ))}
                          </div>
                        </div>
                        {review.review_text && (
                          <p className="text-sm text-muted-foreground">{review.review_text}</p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString("nl-NL")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nog geen reviews. Wees de eerste!</p>
                )}
                <div className="mt-4">
                  <ReviewForm saunaId={sauna.id} saunaName={sauna.name} />
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardContent className="p-5">
                <SaunaFAQ
                  saunaName={sauna.name}
                  plaatsnaam={sauna.plaatsnaam}
                  provincie={sauna.provincie}
                  phone={sauna.phone}
                  website={sauna.website}
                  hasOpeningHours={!!(openingHours && openingHours.length > 0)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 min-w-0">
            <AdPlaceholder sectionKey="detail_sidebar" />

            {/* Internal links sidebar */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Ontdek meer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={`/saunas/${provincie}`} className="block text-sm text-muted-foreground hover:text-primary">
                  Sauna boeken in {province?.name || provincie}
                </Link>
                <Link to={`/saunas/${provincie}/${plaatsnaam}`} className="block text-sm text-muted-foreground hover:text-primary">
                  Alle sauna's in {sauna.plaatsnaam}
                </Link>
                <Link to="/de-beste-saunas-van-nederland" className="block text-sm text-muted-foreground hover:text-primary">
                  Top 10 sauna's om te boeken
                </Link>
                <Link to="/kaart" className="block text-sm text-muted-foreground hover:text-primary">
                  Sauna boeken op de kaart
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Nearby saunas - distance based */}
        {displayNearby.length > 0 && (
          <section className="mt-12 border-t border-border pt-8">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-2xl font-bold">Sauna's & wellness in de buurt</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Ontdek de dichtstbijzijnde sauna's en wellness centra bij {sauna.name}.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayNearby.map((nearby) => (
                <Link key={nearby.id} to={`/saunas/${nearby.provincie_slug}/${nearby.plaatsnaam_slug}/${nearby.slug}`}>
                  <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg h-full">
                    <div className="aspect-[16/10] bg-muted">
                      {nearby.photo_urls && nearby.photo_urls[0] ? (
                        <img
                          src={nearby.photo_urls[0]}
                          alt={`${nearby.name} in ${nearby.plaatsnaam}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <MapPin className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-serif font-semibold truncate">{nearby.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {nearby.plaatsnaam}
                        {"distance" in nearby && ` — ${(nearby as any).distance.toFixed(1)} km`}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        {nearby.average_rating && Number(nearby.average_rating) > 0 ? (
                          <div className="flex items-center gap-1 text-warm-gold">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span className="text-sm font-medium">{Number(nearby.average_rating).toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({nearby.review_count})</span>
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
          </section>
        )}

        {/* SEO text */}
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-serif text-xl font-semibold mb-3">Sauna boeken bij {sauna.name} in {sauna.plaatsnaam}</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-3">
            <p>
              Ben je op zoek naar de perfecte plek om een sauna te boeken in {sauna.plaatsnaam}? {sauna.name} biedt een
              heerlijke wellness ervaring in het hart van {sauna.provincie}. Of je nu komt voor een ontspannende dag,
              een romantisch uitje of gewoon even wilt ontsnappen aan de dagelijkse drukte — bij {sauna.name} ben je
              aan het juiste adres.
            </p>
            <p>
              Vergelijk {sauna.name} met andere sauna's in{" "}
               <Link to={`/saunas/${provincie}/${plaatsnaam}`} className="text-primary hover:underline">
                {sauna.plaatsnaam}
              </Link>{" "}
              en{" "}
              <Link to={`/saunas/${provincie}`} className="text-primary hover:underline">
                {province?.name || provincie}
              </Link>
              . Bekijk reviews van andere bezoekers en boek direct de sauna die bij jou past.
            </p>
          </div>
        </section>

        <AdPlaceholder sectionKey="detail_bottom" className="mt-8" />
      </div>
    </>
  );
};

export default SaunaDetailPage;
