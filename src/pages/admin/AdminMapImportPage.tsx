import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Check, Download, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  place_id: string;
  name: string;
  address: string;
  rating: number | null;
  lat: number;
  lng: number;
}

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const AdminMapImportPage = () => {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(10); // km
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [importingAll, setImportingAll] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();

  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const resultMarkersRef = useRef<L.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([52.2, 5.3], 8);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      setMarker({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker + circle on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old
    if (markerRef.current) { map.removeLayer(markerRef.current); markerRef.current = null; }
    if (circleRef.current) { map.removeLayer(circleRef.current); circleRef.current = null; }

    if (!marker) return;

    const icon = L.divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42"><path d="M16 0C7.16 0 0 7.16 0 16c0 10.97 14.34 24.32 14.97 24.88a1.5 1.5 0 0 0 2.06 0C17.66 40.32 32 26.97 32 16 32 7.16 24.84 0 16 0z" fill="hsl(174,60%,40%)"/><circle cx="16" cy="15" r="7" fill="white" opacity="0.9"/><circle cx="16" cy="15" r="4" fill="hsl(174,60%,40%)"/></svg>`,
      className: "custom-marker",
      iconSize: [32, 42],
      iconAnchor: [16, 42],
    });

    markerRef.current = L.marker([marker.lat, marker.lng], { icon, draggable: true }).addTo(map);
    markerRef.current.on("dragend", () => {
      const pos = markerRef.current?.getLatLng();
      if (pos) setMarker({ lat: pos.lat, lng: pos.lng });
    });

    circleRef.current = L.circle([marker.lat, marker.lng], {
      radius: radius * 1000,
      color: "hsl(174,60%,40%)",
      fillColor: "hsl(174,60%,40%)",
      fillOpacity: 0.1,
      weight: 2,
    }).addTo(map);
  }, [marker, radius]);

  // Clear result markers
  const clearResultMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    resultMarkersRef.current.forEach((m) => map.removeLayer(m));
    resultMarkersRef.current = [];
  }, []);

  // Show result markers on map
  const showResultMarkers = useCallback((items: SearchResult[]) => {
    const map = mapRef.current;
    if (!map) return;
    clearResultMarkers();

    const resultIcon = L.divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="white" stroke-width="2"/></svg>`,
      className: "result-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    items.forEach((r) => {
      if (r.lat && r.lng) {
        const m = L.marker([r.lat, r.lng], { icon: resultIcon }).addTo(map);
        m.bindPopup(`<strong>${r.name}</strong><br/>${r.address || ""}`);
        resultMarkersRef.current.push(m);
      }
    });
  }, [clearResultMarkers]);

  // Search with pagination (up to 3 pages = 60 results)
  const handleSearch = async () => {
    if (!marker) {
      toast({ title: "Klik eerst op de kaart om een locatie te kiezen" });
      return;
    }
    setSearching(true);
    setResults([]);
    clearResultMarkers();

    try {
      let allResults: SearchResult[] = [];
      let nextPageToken: string | null = null;
      let page = 0;

      do {
        // Google requires ~2s delay before using next_page_token
        if (nextPageToken) {
          await new Promise((r) => setTimeout(r, 2500));
        }

        const { data, error } = await supabase.functions.invoke("google-places", {
          body: {
            action: "nearby",
            lat: marker.lat,
            lng: marker.lng,
            radius: radius * 1000,
            pageToken: nextPageToken,
          },
        });

        if (error) throw error;

        allResults = [...allResults, ...(data.results || [])];
        nextPageToken = data.next_page_token;
        page++;

        // Update results live
        setResults([...allResults]);
        showResultMarkers(allResults);

        toast({ title: `Pagina ${page} geladen — ${allResults.length} resultaten` });
      } while (nextPageToken && page < 3);

      if (allResults.length === 0) {
        toast({ title: "Geen sauna's gevonden in dit gebied" });
      }
    } catch (err: any) {
      toast({ title: "Zoeken mislukt", description: err.message, variant: "destructive" });
    }
    setSearching(false);
  };

  const importSingle = async (placeId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("google-places", {
        body: { action: "details", placeId },
      });
      if (error) throw error;

      const d = data.details;
      const { error: insertError } = await supabase.from("saunas").insert({
        name: d.name,
        slug: slugify(d.name),
        address: d.address,
        provincie: d.provincie || "Onbekend",
        plaatsnaam: d.plaatsnaam || "Onbekend",
        provincie_slug: slugify(d.provincie || "onbekend"),
        plaatsnaam_slug: slugify(d.plaatsnaam || "onbekend"),
        phone: d.phone,
        website: d.website,
        opening_hours: d.opening_hours,
        google_place_id: placeId,
        lat: d.lat,
        lng: d.lng,
        photo_urls: d.photo_urls,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          toast({ title: `${d.name} bestaat al` });
          return false;
        }
        throw insertError;
      }
      return true;
    } catch (err: any) {
      toast({ title: "Import mislukt", description: err.message, variant: "destructive" });
      return false;
    }
  };

  const handleImport = async (placeId: string) => {
    setImporting(placeId);
    const success = await importSingle(placeId);
    if (success) {
      toast({ title: "Sauna toegevoegd!" });
      setResults((prev) => prev.filter((r) => r.place_id !== placeId));
    }
    setImporting(null);
  };

  const handleImportAll = async () => {
    if (results.length === 0) return;
    setImportingAll(true);
    setImportProgress({ current: 0, total: results.length });
    let successCount = 0;
    const imported: string[] = [];

    for (let i = 0; i < results.length; i++) {
      setImportProgress({ current: i + 1, total: results.length });
      const success = await importSingle(results[i].place_id);
      if (success) { successCount++; imported.push(results[i].place_id); }
    }

    setResults((prev) => prev.filter((r) => !imported.includes(r.place_id)));
    toast({ title: `${successCount} van ${results.length} sauna's geïmporteerd!` });
    setImportingAll(false);
    setImportProgress({ current: 0, total: 0 });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/admin/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="font-serif text-lg font-bold">Sauna's importeren via kaart</h1>
        </div>
      </header>

      <div className="container py-6 space-y-6">
        {/* Map + controls */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Klik op de kaart om een zoekgebied te kiezen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              ref={containerRef}
              className="rounded-lg border border-border overflow-hidden"
              style={{ height: "450px", width: "100%" }}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">
                  Straal: <span className="text-primary font-bold">{radius} km</span>
                </label>
                <Slider
                  min={1}
                  max={50}
                  step={1}
                  value={[radius]}
                  onValueChange={(v) => setRadius(v[0])}
                />
                <p className="text-xs text-muted-foreground">Grotere straal = meer resultaten (max 60)</p>
              </div>

              {marker && (
                <p className="text-xs text-muted-foreground">
                  📍 {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                </p>
              )}

              <Button onClick={handleSearch} disabled={searching || !marker} size="lg">
                {searching ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Zoeken...</>
                ) : (
                  <>Sauna's zoeken ({radius} km)</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif">{results.length} sauna's gevonden</CardTitle>
                <Button
                  onClick={handleImportAll}
                  disabled={importingAll || importing !== null}
                  size="sm"
                >
                  {importingAll ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-1" />{importProgress.current}/{importProgress.total}</>
                  ) : (
                    <><Download className="h-4 w-4 mr-1" /> Alles importeren ({results.length})</>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {results.map((r) => (
                  <div
                    key={r.place_id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{r.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{r.address}</p>
                      {r.rating && <p className="text-sm text-amber-500">⭐ {r.rating}</p>}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleImport(r.place_id)}
                      disabled={importing === r.place_id || importingAll}
                    >
                      {importing === r.place_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <><Check className="h-4 w-4 mr-1" /> Importeren</>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminMapImportPage;
