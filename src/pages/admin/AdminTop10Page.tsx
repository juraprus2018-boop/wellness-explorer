import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUp, ArrowDown, X, Plus, Loader2, Star, Save } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminTop10Page = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  // All saunas for the dropdown
  const { data: allSaunas } = useQuery({
    queryKey: ["admin-all-saunas"],
    queryFn: async () => {
      const { data } = await supabase
        .from("saunas")
        .select("id, name, plaatsnaam, average_rating")
        .order("name");
      return data || [];
    },
  });

  // Current top 10
  const { data: currentTop10 } = useQuery({
    queryKey: ["admin-top10"],
    queryFn: async () => {
      const { data } = await supabase
        .from("saunas")
        .select("id, name, plaatsnaam, average_rating, top10_position")
        .not("top10_position", "is", null)
        .order("top10_position", { ascending: true });
      return data || [];
    },
  });

  const [slots, setSlots] = useState<(string | null)[]>(Array(10).fill(null));

  // Initialize slots from current top 10
  useEffect(() => {
    if (currentTop10) {
      const newSlots = Array(10).fill(null) as (string | null)[];
      currentTop10.forEach((s) => {
        if (s.top10_position && s.top10_position >= 1 && s.top10_position <= 10) {
          newSlots[s.top10_position - 1] = s.id;
        }
      });
      setSlots(newSlots);
    }
  }, [currentTop10]);

  const getSaunaById = (id: string) => allSaunas?.find((s) => s.id === id);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSlots = [...slots];
    [newSlots[index - 1], newSlots[index]] = [newSlots[index], newSlots[index - 1]];
    setSlots(newSlots);
  };

  const moveDown = (index: number) => {
    if (index === 9) return;
    const newSlots = [...slots];
    [newSlots[index], newSlots[index + 1]] = [newSlots[index + 1], newSlots[index]];
    setSlots(newSlots);
  };

  const removeSlot = (index: number) => {
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
  };

  const setSlot = (index: number, saunaId: string) => {
    const newSlots = [...slots];
    newSlots[index] = saunaId;
    setSlots(newSlots);
  };

  const availableSaunas = allSaunas?.filter((s) => !slots.includes(s.id)) || [];

  const handleSave = async () => {
    setSaving(true);
    try {
      // First clear all top10 positions
      const { error: clearError } = await supabase
        .from("saunas")
        .update({ top10_position: null })
        .not("top10_position", "is", null);
      if (clearError) throw clearError;

      // Set new positions
      for (let i = 0; i < slots.length; i++) {
        if (slots[i]) {
          const { error } = await supabase
            .from("saunas")
            .update({ top10_position: i + 1 })
            .eq("id", slots[i]!);
          if (error) throw error;
        }
      }

      toast({ title: "Top 10 opgeslagen!" });
      queryClient.invalidateQueries({ queryKey: ["admin-top10"] });
      queryClient.invalidateQueries({ queryKey: ["top10"] });
    } catch (err: any) {
      toast({ title: "Opslaan mislukt", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <h1 className="font-serif text-lg font-bold">Top 10 beheren</h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Opslaan
          </Button>
        </div>
      </header>
      <div className="container max-w-2xl py-10">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Selecteer en sorteer de top 10</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {slots.map((saunaId, index) => {
              const sauna = saunaId ? getSaunaById(saunaId) : null;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3"
                >
                  <span className="w-8 text-center font-serif font-bold text-primary">{index + 1}.</span>

                  {sauna ? (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{sauna.name}</p>
                        <p className="text-xs text-muted-foreground">{sauna.plaatsnaam}</p>
                      </div>
                      {sauna.average_rating && Number(sauna.average_rating) > 0 && (
                        <div className="flex items-center gap-1 text-warm-gold shrink-0">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs">{Number(sauna.average_rating).toFixed(1)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveUp(index)} disabled={index === 0}>
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveDown(index)} disabled={index === 9}>
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeSlot(index)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1">
                      <Select onValueChange={(val) => setSlot(index, val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer een sauna..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSaunas.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} — {s.plaatsnaam}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTop10Page;
