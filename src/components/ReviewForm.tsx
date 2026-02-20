import { useState, useRef, useEffect, useCallback } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

const RECAPTCHA_SITE_KEY = "6Lf72tQrAAAAAM1rLy7CSMy9M8mhdfBZJgKeLhzK";

const reviewSchema = z.object({
  reviewer_name: z.string().trim().min(1, "Naam is verplicht").max(100),
  reviewer_email: z.string().trim().email("Ongeldig e-mailadres").max(255),
  rating: z.number().min(1, "Kies een beoordeling").max(5),
  review_text: z.string().trim().max(1000).optional(),
});

interface ReviewFormProps {
  saunaId: string;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const ReviewForm = ({ saunaId }: ReviewFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaWidgetId = useRef<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const renderRecaptcha = useCallback(() => {
    if (
      recaptchaRef.current &&
      window.grecaptcha &&
      window.grecaptcha.render &&
      recaptchaWidgetId.current === null
    ) {
      recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {
        sitekey: RECAPTCHA_SITE_KEY,
      });
    }
  }, []);

  useEffect(() => {
    // If grecaptcha is already loaded, render immediately
    if (window.grecaptcha && window.grecaptcha.render) {
      renderRecaptcha();
    } else {
      // Poll for it (loaded async)
      const interval = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.render) {
          renderRecaptcha();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [renderRecaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = reviewSchema.safeParse({
      reviewer_name: name,
      reviewer_email: email,
      rating,
      review_text: text || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Get reCAPTCHA token
    const recaptchaToken = window.grecaptcha?.getResponse(recaptchaWidgetId.current);
    if (!recaptchaToken) {
      setErrors({ recaptcha: "Bevestig dat je geen robot bent" });
      return;
    }

    setIsSubmitting(true);

    // Verify reCAPTCHA server-side
    try {
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
        "verify-recaptcha",
        { body: { token: recaptchaToken } }
      );

      if (verifyError || !verifyData?.success) {
        toast({
          title: "reCAPTCHA verificatie mislukt",
          description: "Probeer het opnieuw.",
          variant: "destructive",
        });
        window.grecaptcha?.reset(recaptchaWidgetId.current);
        setIsSubmitting(false);
        return;
      }
    } catch {
      toast({
        title: "Fout bij verificatie",
        description: "Probeer het later opnieuw.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      sauna_id: saunaId,
      reviewer_name: result.data.reviewer_name,
      reviewer_email: result.data.reviewer_email,
      rating: result.data.rating,
      review_text: result.data.review_text || null,
    });
    setIsSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        toast({
          title: "Je hebt al een review geplaatst",
          description: "Je kunt slechts één review per sauna plaatsen.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Fout bij plaatsen review", description: error.message, variant: "destructive" });
      }
      window.grecaptcha?.reset(recaptchaWidgetId.current);
      return;
    }

    toast({ title: "Review geplaatst!", description: "Bedankt voor je beoordeling." });
    setName("");
    setEmail("");
    setRating(0);
    setText("");
    window.grecaptcha?.reset(recaptchaWidgetId.current);
    queryClient.invalidateQueries({ queryKey: ["reviews", saunaId] });
    queryClient.invalidateQueries({ queryKey: ["sauna-detail"] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Schrijf een review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star rating */}
          <div className="space-y-2">
            <Label>Beoordeling *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-current text-warm-gold"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && <p className="text-sm text-destructive">{errors.rating}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reviewer-name">Naam *</Label>
              <Input
                id="reviewer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Je naam"
                maxLength={100}
              />
              {errors.reviewer_name && <p className="text-sm text-destructive">{errors.reviewer_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewer-email">E-mail *</Label>
              <Input
                id="reviewer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="je@email.nl"
                maxLength={255}
              />
              {errors.reviewer_email && <p className="text-sm text-destructive">{errors.reviewer_email}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-text">Je ervaring (optioneel)</Label>
            <Textarea
              id="review-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Vertel over je ervaring..."
              maxLength={1000}
              rows={4}
            />
          </div>

          {/* reCAPTCHA widget */}
          <div className="space-y-2">
            <div ref={recaptchaRef} />
            {errors.recaptcha && <p className="text-sm text-destructive">{errors.recaptcha}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Review plaatsen
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
