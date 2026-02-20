import { Link } from "react-router-dom";
import { Plus, List, Trophy, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="font-serif text-lg font-bold">Admin Dashboard</h1>
          <Button variant="ghost" size="sm">
            <LogOut className="mr-2 h-4 w-4" /> Uitloggen
          </Button>
        </div>
      </header>
      <div className="container py-10">
        <div className="grid gap-6 md:grid-cols-3">
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
          <Card>
            <CardHeader>
              <List className="h-8 w-8 text-primary" />
              <CardTitle className="font-serif">Alle sauna's</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">0 sauna's</p>
            </CardContent>
          </Card>
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
