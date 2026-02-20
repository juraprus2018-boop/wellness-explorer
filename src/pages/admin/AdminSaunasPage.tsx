import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Pencil, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const AdminSaunasPage = () => {
  const [search, setSearch] = useState("");

  const { data: saunas = [], isLoading } = useQuery({
    queryKey: ["admin-all-saunas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saunas")
        .select("id, name, plaatsnaam, provincie, average_rating, review_count, slug, provincie_slug, plaatsnaam_slug")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = saunas.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.plaatsnaam.toLowerCase().includes(search.toLowerCase()) ||
      s.provincie.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/admin/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="font-serif text-lg font-bold">Alle sauna's</h1>
        </div>
      </header>
      <div className="container py-6">
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Zoek op naam, plaats of provincie..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naam</TableHead>
                  <TableHead>Plaats</TableHead>
                  <TableHead>Provincie</TableHead>
                  <TableHead className="text-center">Beoordeling</TableHead>
                  <TableHead className="text-center">Reviews</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.plaatsnaam}</TableCell>
                    <TableCell>{s.provincie}</TableCell>
                    <TableCell className="text-center">{s.average_rating ?? "-"}</TableCell>
                    <TableCell className="text-center">{s.review_count ?? 0}</TableCell>
                    <TableCell>
                      <Link to={`/admin/saunas/${s.id}/bewerken`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Geen sauna's gevonden
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        <p className="mt-2 text-sm text-muted-foreground">{filtered.length} sauna's</p>
      </div>
    </div>
  );
};

export default AdminSaunasPage;
