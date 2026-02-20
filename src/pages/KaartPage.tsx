import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

const KaartPage = () => {
  return (
    <div className="container py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Kaart</span>
      </nav>

      <h1 className="mb-2 font-serif text-3xl font-bold">Wellness kaart</h1>
      <p className="mb-8 text-muted-foreground">
        Bekijk alle sauna's en wellness centra op de kaart
      </p>

      {/* Kaart placeholder — Leaflet wordt toegevoegd in Fase 4 */}
      <div className="aspect-[16/9] rounded-lg border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center">
        <MapPin className="mb-3 h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          Interactieve Leaflet kaart wordt hier getoond (Fase 4)
        </p>
      </div>
    </div>
  );
};

export default KaartPage;
