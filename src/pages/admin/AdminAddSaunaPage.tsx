import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, MapPin, Star, Loader2, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const AdminAddSaunaPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [importingAll, setImportingAll] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-places", {
        body: { action: "search", query },
      });
      if (error) throw error;
      setResults(data.results || []);
      if ((data.results || []).length === 0) {
        toast({ title: "Geen resultaten gevonden" });
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
      const provincieSlug = slugify(d.provincie || "onbekend");
      const plaatsnaamSlug = slugify(d.plaatsnaam || "onbekend");
      const saunaSlug = slugify(d.name);

      const { error: insertError } = await supabase.from("saunas").insert({
        name: d.name,
        slug: saunaSlug,
        description: null,
        address: d.address,
        provincie: d.provincie || "Onbekend",
        plaatsnaam: d.plaatsnaam || "Onbekend",
        provincie_slug: provincieSlug,
        plaatsnaam_slug: plaatsnaamSlug,
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
          toast({ title: `${d.name} bestaat al`, variant: "destructive" });
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
      if (success) {
        successCount++;
        imported.push(results[i].place_id);
      }
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
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="font-serif text-lg font-bold">Sauna toevoegen</h1>
        </div>
      </header>
      <div className="container max-w-2xl py-10">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Zoek via Google Places</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Zoek op naam of adres..."
                  className="pl-10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={searching || importingAll}>
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Zoeken"}
              </Button>
            </form>

            {results.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {results.length} resultaten gevonden
                  </p>
                  <Button
                    onClick={handleImportAll}
                    disabled={importingAll || importing !== null}
                    variant="default"
                    size="sm"
                  >
                    {importingAll ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        {importProgress.current}/{importProgress.total}
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-1" /> Alles importeren ({results.length})
                      </>
                    )}
                  </Button>
                </div>

                {results.map((r) => (
                  <div
                    key={r.place_id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{r.name}</p>
                      <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" /> {r.address}
                      </p>
                      {r.rating && (
                        <p className="text-sm text-warm-gold flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-current" /> {r.rating}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleImport(r.place_id)}
                      disabled={importing === r.place_id || importingAll}
                    >
                      {importing === r.place_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Importeren
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAddSaunaPage;
