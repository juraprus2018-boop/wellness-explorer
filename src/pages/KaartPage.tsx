import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PROVINCES } from "@/lib/provinces";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdPlaceholder from "@/components/AdPlaceholder";
import SEOHead from "@/components/SEOHead";
import SafeSaunaMap from "@/components/SafeSaunaMap";

const KaartPage = () => {
  const [selectedProvince, setSelectedProvince] = useState<string>("alle");

  const { data: saunas } = useQuery({
    queryKey: ["saunas-kaart"],
    queryFn: async () => {
      const { data } = await supabase
        .from("saunas")
        .select("id, name, slug, plaatsnaam, plaatsnaam_slug, provincie_slug, provincie, lat, lng, average_rating, review_count")
        .not("lat", "is", null)
        .not("lng", "is", null);
      return data || [];
    },
  });

  const filteredSaunas = useMemo(() => {
    if (!saunas) return [];
    if (selectedProvince === "alle") return saunas;
    return saunas.filter((s) => s.provincie_slug === selectedProvince);
  }, [saunas, selectedProvince]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Sauna Kaart Nederland",
    description: "Interactieve kaart met alle sauna's en wellness centra in Nederland.",
    url: "https://saunaboeken.com/kaart",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://saunaboeken.com/" },
        { "@type": "ListItem", position: 2, name: "Kaart", item: "https://saunaboeken.com/kaart" },
      ],
    },
  };

  return (
    <div className="container py-10">
      <SEOHead
        title="Sauna kaart Nederland — Vind sauna's bij jou in de buurt | Saunaboeken.com"
        description="Bekijk alle sauna's en wellness centra op een interactieve kaart van Nederland. Filter op provincie en vind direct een sauna bij jou in de buurt."
        canonical="https://saunaboeken.com/kaart"
        jsonLd={jsonLd}
      />

      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Kaart</span>
      </nav>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Sauna kaart van Nederland</h1>
          <p className="text-muted-foreground">
            {filteredSaunas.length} sauna's en wellness centra op de kaart. Klik op een marker voor meer informatie.
          </p>
        </div>
        <Select value={selectedProvince} onValueChange={setSelectedProvince}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter op provincie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle provincies</SelectItem>
            {PROVINCES.map((p) => (
              <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AdPlaceholder className="mb-6" />

      <SafeSaunaMap saunas={filteredSaunas} height="70vh" />

      {/* Internal links */}
      <section className="mt-10 border-t border-border pt-6">
        <h2 className="mb-3 font-serif text-xl font-semibold">Bekijk sauna's per provincie</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {PROVINCES.map((p) => (
            <Link
              key={p.slug}
              to={`/sauna/${p.slug}`}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
            >
              {p.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default KaartPage;
