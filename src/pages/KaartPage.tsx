import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PROVINCES } from "@/lib/provinces";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdPlaceholder from "@/components/AdPlaceholder";
import SaunaMap from "@/components/SaunaMap";

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

  return (
    <div className="container py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Kaart</span>
      </nav>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Wellness kaart</h1>
          <p className="text-muted-foreground">
            {filteredSaunas.length} sauna's op de kaart
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

      <SaunaMap saunas={filteredSaunas} height="70vh" />
    </div>
  );
};

export default KaartPage;
