import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { PROVINCES } from "@/lib/provinces";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-serif text-lg font-bold">Saunaboeken</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Ontdek de beste sauna's en wellness centra van Nederland.
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
          <h4 className="font-serif font-semibold mb-3">Links</h4>
          <div className="flex flex-col gap-1">
            <Link to="/kaart" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Kaart
            </Link>
            <Link to="/de-beste-saunas-van-nederland" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Top 10 Sauna's
            </Link>
          </div>
          <h4 className="font-serif font-semibold mb-3 mt-6">Over ons</h4>
          <p className="text-sm text-muted-foreground">
            Saunaboeken.com helpt je de perfecte sauna te vinden. Onafhankelijk en betrouwbaar.
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
