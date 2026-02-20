import { Link } from "react-router-dom";
import { ArrowLeft, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminTop10Page = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/admin/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="font-serif text-lg font-bold">Top 10 beheren</h1>
        </div>
      </header>
      <div className="container max-w-2xl py-10">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Sleep om de volgorde te wijzigen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-primary">{i + 1}.</span>
                  <span className="text-muted-foreground">
                    Nog geen sauna geselecteerd
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Drag & drop wordt actief zodra de database is verbonden.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTop10Page;
