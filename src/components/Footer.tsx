import { Link } from "react-router-dom";
import { MapPin, Star, Map } from "lucide-react";
import { PROVINCES } from "@/lib/provinces";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-serif text-lg font-bold">saunaboeken.com</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Sauna boeken? Dé onafhankelijke saunagids van Nederland. Vind, vergelijk en boek sauna's en wellness centra in alle 12 provincies.
          </p>
        </div>
        <div>
          <h4 className="font-serif font-semibold mb-3">Provincies</h4>
          <div className="grid grid-cols-2 gap-1">
            {PROVINCES.map((p) => (
              <Link
                key={p.slug}
                to={`/sauna/${p.slug}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {p.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-serif font-semibold mb-3">Populaire pagina's</h4>
          <div className="flex flex-col gap-1">
            <Link to="/de-beste-saunas-van-nederland" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Star className="h-3 w-3" /> Top 10 Sauna's
            </Link>
            <Link to="/kaart" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Map className="h-3 w-3" /> Sauna Kaart
            </Link>
          </div>
          <h4 className="font-serif font-semibold mb-3 mt-6">Populaire steden</h4>
          <div className="flex flex-col gap-1">
            <Link to="/sauna/noord-holland/amsterdam" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Sauna boeken Amsterdam
            </Link>
            <Link to="/sauna/zuid-holland/rotterdam" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Sauna boeken Rotterdam
            </Link>
            <Link to="/sauna/utrecht/utrecht" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Sauna boeken Utrecht
            </Link>
          </div>
        </div>
        <div>
          <h4 className="font-serif font-semibold mb-3">Over Saunaboeken.com</h4>
          <p className="text-sm text-muted-foreground">
            Saunaboeken.com helpt je de perfecte sauna te boeken. Onafhankelijk, betrouwbaar en altijd up-to-date. Vergelijk sauna's, lees reviews en boek direct jouw wellness ervaring.
          </p>
        </div>
      </div>
      <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Saunaboeken.com — Alle rechten voorbehouden.
      </div>
    </div>
  </footer>
);

export default Footer;
