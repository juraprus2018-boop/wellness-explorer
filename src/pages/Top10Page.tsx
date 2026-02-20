import { Link } from "react-router-dom";
import { Star, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AdPlaceholder from "@/components/AdPlaceholder";

const Top10Page = () => {
  return (
    <div className="container py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">De beste sauna's van Nederland</span>
      </nav>

      <div className="mb-10 text-center">
        <Trophy className="mx-auto mb-4 h-12 w-12 text-warm-gold" />
        <h1 className="font-serif text-4xl font-bold">
          De 10 beste sauna's van Nederland
        </h1>
        <p className="mt-2 text-muted-foreground">
          Onze selectie van de meest gewaardeerde wellness centra
        </p>
      </div>

      <AdPlaceholder className="mb-8" />

      <div className="space-y-4">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i}>
            <Card className="transition-all hover:shadow-lg">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-xl font-bold text-primary">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-lg font-semibold">Sauna #{i + 1}</h3>
                  <p className="text-sm text-muted-foreground">
                    Wordt gevuld zodra de database is verbonden
                  </p>
                </div>
                <div className="flex items-center gap-1 text-warm-gold">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium">—</span>
                </div>
              </CardContent>
            </Card>
            {/* Ad between items 3 and 7 */}
            {(i === 2 || i === 6) && <AdPlaceholder className="my-4" />}
          </div>
        ))}
      </div>

      <AdPlaceholder className="mt-8" />
    </div>
  );
};

export default Top10Page;
