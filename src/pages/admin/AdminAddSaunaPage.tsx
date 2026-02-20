import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminAddSaunaPage = () => {
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
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Zoek op naam of adres..." className="pl-10" disabled />
              </div>
              <Button disabled>Zoeken</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Google Places API wordt verbonden zodra Cloud beschikbaar is.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAddSaunaPage;
