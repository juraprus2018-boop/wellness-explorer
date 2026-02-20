import { useParams, Link } from "react-router-dom";
import { MapPin, ArrowRight, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PROVINCES } from "@/lib/provinces";
import { Card, CardContent } from "@/components/ui/card";
import AdPlaceholder from "@/components/AdPlaceholder";
import { supabase } from "@/integrations/supabase/client";
import SafeSaunaMap from "@/components/SafeSaunaMap";

const ProvinciePage = () => {
  const { provincie } = useParams<{ provincie: string }>();
  const province = PROVINCES.find((p) => p.slug === provincie);

  const { data: plaatsen, isLoading } = useQuery({
    queryKey: ["plaatsen", provincie],
    queryFn: async () => {
      const { data } = await supabase
        .from("saunas")
        .select("plaatsnaam, plaatsnaam_slug")
        .eq("provincie_slug", provincie!)
        .order("plaatsnaam");
      const map = new Map<string, { name: string; slug: string; count: number }>();
      (data || []).forEach((s) => {
        const existing = map.get(s.plaatsnaam_slug);
        if (existing) {
          existing.count++;
        } else {
          map.set(s.plaatsnaam_slug, { name: s.plaatsnaam, slug: s.plaatsnaam_slug, count: 1 });
        }
      });
      return Array.from(map.values());
    },
    enabled: !!provincie,
  });

  const { data: saunasForMap } = useQuery({
    queryKey: ["saunas-map-provincie", provincie],
    queryFn: async () => {
      const { data } = await supabase
        .from("saunas")
        .select("id, name, slug, plaatsnaam, plaatsnaam_slug, provincie_slug, lat, lng, average_rating, review_count")
        .eq("provincie_slug", provincie!)
        .not("lat", "is", null)
        .not("lng", "is", null);
      return data || [];
    },
    enabled: !!provincie,
  });

  if (!province) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-serif text-3xl font-bold">Provincie niet gevonden</h1>
        <p className="mt-2 text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">Terug naar home</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{province.name}</span>
      </nav>

      <h1 className="mb-2 font-serif text-3xl font-bold">Sauna's in {province.name}</h1>
      <p className="mb-8 text-muted-foreground">
        Ontdek alle wellness centra en sauna's in de provincie {province.name}.
      </p>

      <AdPlaceholder className="mb-8" />

      {saunasForMap && saunasForMap.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 font-serif text-xl font-semibold">Kaart</h2>
          <SafeSaunaMap saunas={saunasForMap} height="350px" />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : plaatsen && plaatsen.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {plaatsen.map((plaats) => (
            <Link key={plaats.slug} to={`/sauna/${provincie}/${plaats.slug}`}>
              <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30">
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">{plaats.name}</span>
                      <p className="text-xs text-muted-foreground">{plaats.count} sauna's</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Er zijn nog geen sauna's toegevoegd in {province.name}.
          </p>
        </div>
      )}

      <AdPlaceholder className="mt-8" />
    </div>
  );
};

export default ProvinciePage;
