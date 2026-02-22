import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, Loader2, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Naam is verplicht").max(100),
  email: z.string().trim().email("Ongeldig e-mailadres").max(255),
  subject: z.string().trim().min(1, "Onderwerp is verplicht").max(200),
  message: z.string().trim().min(10, "Bericht moet minimaal 10 tekens bevatten").max(2000),
});

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: { type: "contact", data: result.data },
      });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Bericht verzonden!", description: "We nemen zo snel mogelijk contact met je op." });
    } catch (err: any) {
      toast({ title: "Verzenden mislukt", description: err.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact — Saunaboeken.com",
    url: "https://saunaboeken.com/contact",
  };

  return (
    <div className="container py-10">
      <SEOHead
        title="Contact — Saunaboeken.com | Vragen over sauna boeken?"
        description="Neem contact op met saunaboeken.com. Heb je vragen over het boeken van een sauna? Wij helpen je graag verder."
        canonical="https://saunaboeken.com/contact"
        jsonLd={jsonLd}
      />

      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Contact</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="mb-2 font-serif text-3xl font-bold">Contact opnemen</h1>
          <p className="mb-6 text-muted-foreground">
            Heb je vragen over het boeken van een sauna, wil je samenwerken of heb je feedback? Vul het formulier in en we reageren zo snel mogelijk.
          </p>

          {submitted ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Mail className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h2 className="font-serif text-xl font-bold">Bedankt voor je bericht!</h2>
                <p className="mt-2 text-muted-foreground">We nemen zo snel mogelijk contact met je op.</p>
                <Button asChild className="mt-6">
                  <Link to="/">Terug naar home</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Stuur ons een bericht</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Naam *</Label>
                      <Input
                        id="contact-name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Je naam"
                        maxLength={100}
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">E-mail *</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="je@email.nl"
                        maxLength={255}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-subject">Onderwerp *</Label>
                    <Input
                      id="contact-subject"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="Waar gaat je bericht over?"
                      maxLength={200}
                    />
                    {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Bericht *</Label>
                    <Textarea
                      id="contact-message"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Typ hier je bericht..."
                      maxLength={2000}
                      rows={6}
                    />
                    {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                  </div>
                  <Button type="submit" disabled={isSubmitting} size="lg">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Bericht versturen
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">E-mail</p>
                  <a href="mailto:info@saunaboeken.com" className="text-sm text-muted-foreground hover:text-primary">info@saunaboeken.com</a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-2 font-serif font-semibold">Sauna boeken?</h3>
              <p className="text-sm text-muted-foreground">
                Bekijk ons overzicht van sauna's in Nederland en boek direct bij de sauna van je keuze.
              </p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/kaart">Bekijk alle sauna's op de kaart</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
