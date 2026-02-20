import { useParams, Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";

const PlaatsPage = () => {
  const { provincie, plaatsnaam } = useParams<{ provincie: string; plaatsnaam: string }>();

  return (
    <div className="container py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/sauna/${provincie}`} className="hover:text-primary capitalize">{provincie}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground capitalize">{plaatsnaam}</span>
      </nav>

      <h1 className="mb-2 font-serif text-3xl font-bold capitalize">
        Sauna's in {plaatsnaam}
      </h1>
      <p className="mb-8 text-muted-foreground capitalize">
        Alle wellness centra in {plaatsnaam}, {provincie}.
      </p>

      <AdPlaceholder className="mb-8" />

      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
        <MapPin className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          Sauna's worden hier getoond zodra de database is verbonden.
        </p>
      </div>
    </div>
  );
};

export default PlaatsPage;
