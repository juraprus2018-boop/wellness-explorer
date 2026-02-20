import { Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface AdSetting {
  id: string;
  section_key: string;
  section_label: string;
  ad_slot: string;
  ad_client: string;
  is_active: boolean;
}

const AdminAdsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<AdSetting[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-ad-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_settings")
        .select("*")
        .order("section_label");
      if (error) throw error;
      return data as AdSetting[];
    },
  });

  useEffect(() => {
    if (data) setSettings(data);
  }, [data]);

  const updateField = (id: string, field: keyof AdSetting, value: string | boolean) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const s of settings) {
        const { error } = await supabase
          .from("ad_settings")
          .update({
            ad_slot: s.ad_slot,
            ad_client: s.ad_client,
            is_active: s.is_active,
          })
          .eq("id", s.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-settings"] });
      toast({ title: "Advertentie-instellingen opgeslagen!" });
    },
    onError: (err: any) => {
      toast({ title: "Opslaan mislukt", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="font-serif text-lg font-bold">Google Ads beheren</h1>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Opslaan
          </Button>
        </div>
      </header>
      <div className="container max-w-2xl py-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          Configureer hier je Google AdSense advertenties per sectie. Vul je <strong>data-ad-client</strong> en <strong>data-ad-slot</strong> in en activeer de secties waar je ads wilt tonen.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          settings.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-serif">{s.section_label}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${s.id}`} className="text-sm text-muted-foreground">
                      Actief
                    </Label>
                    <Switch
                      id={`active-${s.id}`}
                      checked={s.is_active}
                      onCheckedChange={(v) => updateField(s.id, "is_active", v)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Ad Client (data-ad-client)</Label>
                  <Input
                    placeholder="ca-pub-XXXXXXXXXX"
                    value={s.ad_client}
                    onChange={(e) => updateField(s.id, "ad_client", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Ad Slot (data-ad-slot)</Label>
                  <Input
                    placeholder="1234567890"
                    value={s.ad_slot}
                    onChange={(e) => updateField(s.id, "ad_slot", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAdsPage;
