import { Link } from "react-router-dom";
import { Plus, List, Trophy, LogOut, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboardPage = () => {
  const { signOut } = useAuth();

  const { data: saunaCount = 0 } = useQuery({
    queryKey: ["admin-sauna-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("saunas")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="font-serif text-lg font-bold">Admin Dashboard</h1>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Uitloggen
          </Button>
        </div>
      </header>
      <div className="container py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/admin/saunas/toevoegen">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/30">
              <CardHeader>
                <Plus className="h-8 w-8 text-primary" />
                <CardTitle className="font-serif">Sauna toevoegen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Zoek en voeg een sauna toe via Google Places API
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/saunas">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/30">
              <CardHeader>
                <List className="h-8 w-8 text-primary" />
                <CardTitle className="font-serif">Alle sauna's</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{saunaCount} sauna's beheren</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/top-10">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/30">
              <CardHeader>
                <Trophy className="h-8 w-8 text-warm-gold" />
                <CardTitle className="font-serif">Top 10 beheren</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bepaal de volgorde van de top 10
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/advertenties">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/30">
              <CardHeader>
                <Megaphone className="h-8 w-8 text-primary" />
                <CardTitle className="font-serif">Advertenties</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Google Ads per sectie configureren
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
