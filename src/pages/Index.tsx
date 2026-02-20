import { Link } from "react-router-dom";
import { Search, Star, MapPin, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PROVINCES } from "@/lib/provinces";
import AdPlaceholder from "@/components/AdPlaceholder";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-sauna.jpg";

const Index = () => {
  const [search, setSearch] = useState("");

  const filteredProvinces = PROVINCES.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Count saunas per province
  const { data: provinceCounts } = useQuery({
    queryKey: ["province-counts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("saunas")
        .select("provincie_slug");
      const counts: Record<string, number> = {};
      (data || []).forEach((s) => {
        counts[s.provincie_slug] = (counts[s.provincie_slug] || 0) + 1;
      });
      return counts;
    },
  });

  // Top rated saunas for teaser
  const { data: topSaunas } = useQuery({
    queryKey: ["top-saunas-home"],
    queryFn: async () => {
      const { data } = await supabase
        .from("saunas")
        .select("id, name, slug, plaatsnaam, plaatsnaam_slug, provincie_slug, average_rating, photo_urls")
        .order("average_rating", { ascending: false })
        .limit(4);
      return data || [];
    },
  });

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Sfeervolle sauna" className="h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-background" />
        </div>
        <div className="container relative flex flex-col items-center py-24 text-center md:py-36">
          <h1 className="mb-4 max-w-3xl text-4xl font-bold text-white md:text-5xl lg:text-6xl font-serif">
            Ontdek de beste sauna's van Nederland
          </h1>
          <p className="mb-8 max-w-xl text-lg text-white/85">
            Vind en vergelijk wellness centra bij jou in de buurt. Lees reviews en boek direct.
          </p>
          <div className="flex w-full max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Zoek op provincie of plaats..."
                className="pl-10 bg-background/95"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button>Zoeken</Button>
          </div>
        </div>
      </section>

      <AdPlaceholder className="container mt-6" />

      {/* Provincies overzicht */}
      <section className="container py-16">
        <h2 className="mb-2 text-center font-serif text-3xl font-bold">Sauna's per provincie</h2>
        <p className="mb-10 text-center text-muted-foreground">Kies een provincie om alle wellness locaties te bekijken</p>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProvinces.map((province) => (
            <Link key={province.slug} to={`/sauna/${province.slug}`}>
              <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30">
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">{province.name}</span>
                      {provinceCounts && provinceCounts[province.slug] > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {provinceCounts[province.slug]} sauna's
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured saunas */}
      {topSaunas && topSaunas.length > 0 && (
        <section className="container py-16">
          <h2 className="mb-2 text-center font-serif text-3xl font-bold">Populaire sauna's</h2>
          <p className="mb-10 text-center text-muted-foreground">De best beoordeelde wellness centra</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {topSaunas.map((sauna) => (
              <Link key={sauna.id} to={`/sauna/${sauna.provincie_slug}/${sauna.plaatsnaam_slug}/${sauna.slug}`}>
                <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
                  <div className="aspect-[4/3] bg-muted">
                    {sauna.photo_urls && sauna.photo_urls[0] ? (
                      <img src={sauna.photo_urls[0]} alt={sauna.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <MapPin className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-serif font-semibold truncate">{sauna.name}</h3>
                    <p className="text-sm text-muted-foreground">{sauna.plaatsnaam}</p>
                    {sauna.average_rating && Number(sauna.average_rating) > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-warm-gold">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{Number(sauna.average_rating).toFixed(1)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top Sauna's teaser */}
      <section className="bg-card py-16">
        <div className="container text-center">
          <Star className="mx-auto mb-4 h-10 w-10 text-warm-gold" />
          <h2 className="mb-2 font-serif text-3xl font-bold">De beste sauna's van Nederland</h2>
          <p className="mb-6 text-muted-foreground">Bekijk onze top 10 van de meest gewaardeerde wellness centra</p>
          <Button asChild size="lg">
            <Link to="/de-beste-saunas-van-nederland">
              Bekijk Top 10 <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <AdPlaceholder className="container my-6" />
    </>
  );
};

export default Index;
