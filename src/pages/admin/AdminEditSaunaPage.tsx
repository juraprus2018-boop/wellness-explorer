import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminEditSaunaPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sauna, isLoading } = useQuery({
    queryKey: ["admin-sauna", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("saunas").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    plaatsnaam: "",
    provincie: "",
    phone: "",
    website: "",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    if (sauna) {
      setForm({
        name: sauna.name || "",
        description: sauna.description || "",
        address: sauna.address || "",
        plaatsnaam: sauna.plaatsnaam || "",
        provincie: sauna.provincie || "",
        phone: sauna.phone || "",
        website: sauna.website || "",
        lat: sauna.lat?.toString() || "",
        lng: sauna.lng?.toString() || "",
      });
    }
  }, [sauna]);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const { error } = await supabase
        .from("saunas")
        .update({
          name: form.name,
          slug: slugify(form.name),
          description: form.description || null,
          address: form.address || null,
          plaatsnaam: form.plaatsnaam,
          plaatsnaam_slug: slugify(form.plaatsnaam),
          provincie: form.provincie,
          provincie_slug: slugify(form.provincie),
          phone: form.phone || null,
          website: form.website || null,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
        })
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-saunas"] });
      toast({ title: "Sauna opgeslagen!" });
      navigate("/admin/saunas");
    },
    onError: (err: any) => {
      toast({ title: "Opslaan mislukt", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("saunas").delete().eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-saunas"] });
      toast({ title: "Sauna verwijderd" });
      navigate("/admin/saunas");
    },
    onError: (err: any) => {
      toast({ title: "Verwijderen mislukt", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/saunas">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="font-serif text-lg font-bold">Sauna bewerken</h1>
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" /> Verwijderen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sauna verwijderen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Dit verwijdert de sauna en alle bijbehorende reviews permanent.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuleren</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                    Verwijderen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Opslaan
            </Button>
          </div>
        </div>
      </header>
      <div className="container max-w-2xl py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Basisgegevens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Naam</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div>
              <Label>Beschrijving</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} />
            </div>
            <div>
              <Label>Adres</Label>
              <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Plaatsnaam</Label>
                <Input value={form.plaatsnaam} onChange={(e) => update("plaatsnaam", e.target.value)} />
              </div>
              <div>
                <Label>Provincie</Label>
                <Input value={form.provincie} onChange={(e) => update("provincie", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Contact & Locatie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Telefoon</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => update("website", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input value={form.lat} onChange={(e) => update("lat", e.target.value)} />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input value={form.lng} onChange={(e) => update("lng", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminEditSaunaPage;
