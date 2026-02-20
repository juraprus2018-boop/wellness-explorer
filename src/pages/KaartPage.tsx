import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PROVINCES } from "@/lib/provinces";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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

  // Center of Netherlands
  const center: [number, number] = [52.2, 5.3];

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

      <div className="overflow-hidden rounded-lg border border-border" style={{ height: "70vh" }}>
        <MapContainer
          center={center}
          zoom={8}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredSaunas.map((sauna) => (
            <Marker key={sauna.id} position={[sauna.lat!, sauna.lng!]}>
              <Popup>
                <div className="min-w-[180px]">
                  <p className="font-semibold text-sm mb-1">{sauna.name}</p>
                  <p className="text-xs text-gray-500 mb-1">{sauna.plaatsnaam}, {sauna.provincie}</p>
                  {sauna.average_rating && Number(sauna.average_rating) > 0 && (
                    <p className="text-xs mb-2">⭐ {Number(sauna.average_rating).toFixed(1)} ({sauna.review_count} reviews)</p>
                  )}
                  <a
                    href={`/sauna/${sauna.provincie_slug}/${sauna.plaatsnaam_slug}/${sauna.slug}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Bekijk details →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default KaartPage;
