import { useParams, Link } from "react-router-dom";
import { MapPin, Phone, Globe, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdPlaceholder from "@/components/AdPlaceholder";

const SaunaDetailPage = () => {
  const { provincie, plaatsnaam, slug } = useParams<{
    provincie: string;
    plaatsnaam: string;
    slug: string;
  }>();

  return (
    <div className="container py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/sauna/${provincie}`} className="hover:text-primary capitalize">{provincie}</Link>
        <span className="mx-2">/</span>
        <Link to={`/sauna/${provincie}/${plaatsnaam}`} className="hover:text-primary capitalize">{plaatsnaam}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground capitalize">{slug?.replace(/-/g, " ")}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo placeholder */}
          <div className="aspect-video rounded-lg bg-muted flex items-center justify-center border border-dashed border-border">
            <p className="text-muted-foreground">Foto's verschijnen hier</p>
          </div>

          <h1 className="font-serif text-3xl font-bold capitalize">
            {slug?.replace(/-/g, " ")}
          </h1>

          {/* Info cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Adres</p>
                  <p className="font-medium capitalize">{plaatsnaam}, {provincie}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Openingstijden</p>
                  <p className="font-medium">Wordt geladen...</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefoon</p>
                  <p className="font-medium">Wordt geladen...</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Star className="h-5 w-5 text-warm-gold" />
                <div>
                  <p className="text-sm text-muted-foreground">Beoordeling</p>
                  <p className="font-medium">Nog geen reviews</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Beschrijving</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Beschrijving wordt geladen zodra de database is verbonden.
              </p>
            </CardContent>
          </Card>

          {/* CTA */}
          <Button size="lg" className="w-full sm:w-auto">
            <Globe className="mr-2 h-4 w-4" />
            Bezoek website
          </Button>

          <AdPlaceholder className="mt-6" />

          {/* Reviews section placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Reviews verschijnen hier zodra de database is verbonden.
              </p>
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
                <p className="text-sm text-muted-foreground">Review formulier (komt in Fase 4)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AdPlaceholder />
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Meer in {plaatsnaam}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Andere sauna's in deze plaats worden hier getoond.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SaunaDetailPage;
