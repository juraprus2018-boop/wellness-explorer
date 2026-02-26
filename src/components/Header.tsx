import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Menu, Star, Map, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { PROVINCES } from "@/lib/provinces";

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl font-bold text-foreground">
            saunaboeken.com
          </span>
        </Link>

        {/* Desktop nav */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link
                to="/"
                className="inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Home
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-muted-foreground">
                Provincies
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[400px] gap-1 p-4 md:w-[500px] md:grid-cols-3">
                  {PROVINCES.map((p) => (
                    <Link
                      key={p.slug}
                      to={`/saunas/${p.slug}`}
                      className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link
                to="/kaart"
                className="inline-flex h-10 items-center gap-1.5 justify-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <Map className="h-4 w-4" /> Kaart
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link
                to="/de-beste-saunas-van-nederland"
                className="inline-flex h-10 items-center gap-1.5 justify-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <Star className="h-4 w-4" /> Top 10
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link
                to="/contact"
                className="inline-flex h-10 items-center gap-1.5 justify-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4" /> Contact
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="overflow-y-auto">
            <SheetTitle className="font-serif">Menu</SheetTitle>
            <nav className="mt-6 flex flex-col gap-3">
              <Link to="/" className="text-lg font-medium text-foreground hover:text-primary" onClick={() => setOpen(false)}>
                Home
              </Link>
              <Link to="/kaart" className="text-lg font-medium text-foreground hover:text-primary" onClick={() => setOpen(false)}>
                Kaart
              </Link>
              <Link to="/de-beste-saunas-van-nederland" className="text-lg font-medium text-foreground hover:text-primary" onClick={() => setOpen(false)}>
                Top 10 Sauna's
              </Link>
              <Link to="/contact" className="text-lg font-medium text-foreground hover:text-primary" onClick={() => setOpen(false)}>
                Contact
              </Link>
              <div className="mt-2 border-t border-border pt-3">
                <p className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Provincies</p>
                <div className="grid grid-cols-2 gap-1">
                  {PROVINCES.map((p) => (
                    <Link
                      key={p.slug}
                      to={`/saunas/${p.slug}`}
                      className="rounded-md px-2 py-1.5 text-sm text-foreground hover:text-primary hover:bg-accent"
                      onClick={() => setOpen(false)}
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
