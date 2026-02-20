import { useParams, Link } from "react-router-dom";
import { MapPin, Phone, Globe, Star, Clock, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import AdPlaceholder from "@/components/AdPlaceholder";
import ReviewForm from "@/components/ReviewForm";
import { supabase } from "@/integrations/supabase/client";
import { PROVINCES } from "@/lib/provinces";

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

  const { data: relatedSaunas } = useQuery({
    queryKey: ["related-saunas", provincie, plaatsnaam, sauna?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("saunas")
        .select("id, name, slug, average_rating")
        .eq("provincie_slug", provincie!)
        .eq("plaatsnaam_slug", plaatsnaam!)
        .neq("id", sauna!.id)
        .limit(5);
      return data || [];
    },
    enabled: !!sauna?.id,
  });

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

  return (
    <>
      {/* Full-width hero banner */}
      {sauna.photo_urls && sauna.photo_urls.length > 0 ? (
        <div className="relative w-full">
          <Carousel className="w-full">
            <CarouselContent>
              {sauna.photo_urls.map((url, i) => (
                <CarouselItem key={i}>
                  <div className="relative h-[35vh] sm:h-[45vh] md:h-[55vh] w-full">
                    <img
                      src={url}
                      alt={`${sauna.name} foto ${i + 1}`}
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
          {/* Overlay title on banner */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                {sauna.name}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-white/85 text-sm sm:text-base drop-shadow">
                <MapPin className="h-4 w-4" />
                {sauna.plaatsnaam}, {sauna.provincie}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-[30vh] w-full bg-muted flex items-center justify-center">
          <MapPin className="h-12 w-12 text-muted-foreground/30" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-t from-foreground/40 to-transparent">
            <div className="container">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                {sauna.name}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-white/85 text-sm">
                <MapPin className="h-4 w-4" />
                {sauna.plaatsnaam}, {sauna.provincie}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="container py-8">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to={`/sauna/${provincie}`} className="hover:text-primary">{province?.name || provincie}</Link>
          <span className="mx-2">/</span>
          <Link to={`/sauna/${provincie}/${plaatsnaam}`} className="hover:text-primary">{sauna.plaatsnaam}</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{sauna.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Info cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <MapPin className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Adres</p>
                    <p className="font-medium">{sauna.address || `${sauna.plaatsnaam}, ${sauna.provincie}`}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <Clock className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Openingstijden</p>
                    {openingHours && openingHours.length > 0 ? (
                      <div className="text-sm font-medium">
                        {openingHours.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="font-medium">Niet beschikbaar</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              {sauna.phone && (
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Phone className="h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Telefoon</p>
                      <a href={`tel:${sauna.phone}`} className="font-medium text-primary hover:underline">
                        {sauna.phone}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <Star className="h-5 w-5 shrink-0 text-warm-gold" />
                  <div>
                    <p className="text-sm text-muted-foreground">Beoordeling</p>
                    <p className="font-medium">
                      {sauna.average_rating != null && Number(sauna.average_rating) > 0
                        ? `${Number(sauna.average_rating).toFixed(1)} / 5 (${sauna.review_count} reviews)`
                        : "Nog geen reviews"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {sauna.description && (
              <Card>
                <CardHeader><CardTitle className="font-serif">Beschrijving</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">{sauna.description}</p></CardContent>
              </Card>
            )}

            {/* CTA */}
            {sauna.website && (
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <a href={sauna.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" /> Bezoek website
                </a>
              </Button>
            )}

            <AdPlaceholder className="mt-6" />

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
                  <ReviewForm saunaId={sauna.id} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AdPlaceholder />
            {relatedSaunas && relatedSaunas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Meer in {sauna.plaatsnaam}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {relatedSaunas.map((r) => (
                    <Link
                      key={r.id}
                      to={`/sauna/${provincie}/${plaatsnaam}/${r.slug}`}
                      className="flex items-center justify-between rounded-lg p-2 hover:bg-muted transition-colors"
                    >
                      <span className="text-sm font-medium truncate">{r.name}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {r.average_rating != null && Number(r.average_rating) > 0 && (
                          <>
                            <Star className="h-3 w-3 text-warm-gold fill-current" />
                            <span className="text-xs">{Number(r.average_rating).toFixed(1)}</span>
                          </>
                        )}
                        <ArrowRight className="h-3 w-3 text-muted-foreground ml-1" />
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SaunaDetailPage;
