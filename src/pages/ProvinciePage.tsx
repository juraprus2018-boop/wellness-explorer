import { useParams, Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { PROVINCES } from "@/lib/provinces";
import { Card, CardContent } from "@/components/ui/card";
import AdPlaceholder from "@/components/AdPlaceholder";

const ProvinciePage = () => {
  const { provincie } = useParams<{ provincie: string }>();
  const province = PROVINCES.find((p) => p.slug === provincie);

  if (!province) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-serif text-3xl font-bold">Provincie niet gevonden</h1>
        <p className="mt-2 text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">Terug naar home</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{province.name}</span>
      </nav>

      <h1 className="mb-2 font-serif text-3xl font-bold">
        Sauna's in {province.name}
      </h1>
      <p className="mb-8 text-muted-foreground">
        Ontdek alle wellness centra en sauna's in de provincie {province.name}.
      </p>

      <AdPlaceholder className="mb-8" />

      {/* Placeholder — wordt gevuld met data uit de database */}
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
        <MapPin className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          Plaatsen met sauna's worden hier getoond zodra de database is verbonden.
        </p>
      </div>
    </div>
  );
};

export default ProvinciePage;
