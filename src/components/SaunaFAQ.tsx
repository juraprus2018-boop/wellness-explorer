import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SaunaFAQProps {
  saunaName: string;
  plaatsnaam: string;
  provincie: string;
  phone?: string | null;
  website?: string | null;
  hasOpeningHours: boolean;
}

const SaunaFAQ = ({ saunaName, plaatsnaam, provincie, phone, website, hasOpeningHours }: SaunaFAQProps) => {
  const faqs = [
    {
      q: `Hoe kan ik een sauna boeken bij ${saunaName}?`,
      a: `Je kunt eenvoudig een sauna boeken bij ${saunaName} in ${plaatsnaam} via onze website. Klik op de knop 'Sauna boeken' om direct naar de boekingspagina te gaan.${website ? " Je wordt doorgestuurd naar de officiële website voor de reservering." : ""}`,
    },
    {
      q: `Wat zijn de openingstijden van ${saunaName}?`,
      a: hasOpeningHours
        ? `De openingstijden van ${saunaName} staan hierboven vermeld. Controleer voor je bezoek altijd de actuele tijden, deze kunnen tijdens feestdagen afwijken.`
        : `De openingstijden van ${saunaName} zijn momenteel niet beschikbaar op onze website.${phone ? ` Neem contact op via ${phone} voor de actuele openingstijden.` : ""}`,
    },
    {
      q: `Waar ligt ${saunaName} precies?`,
      a: `${saunaName} bevindt zich in ${plaatsnaam}, ${provincie}. Bekijk de kaart op deze pagina voor de exacte locatie en routebeschrijving.`,
    },
    {
      q: `Zijn er andere sauna's in de buurt van ${saunaName}?`,
      a: `Ja! Bekijk de sectie 'Sauna's in de buurt' op deze pagina voor meer opties in ${plaatsnaam} en omgeving. Je kunt ook onze kaartpagina bekijken voor een overzicht van alle sauna's in ${provincie}.`,
    },
    {
      q: `Heeft ${saunaName} goede reviews?`,
      a: `Bekijk de reviews van bezoekers op deze pagina. Wij tonen zowel reviews van onze bezoekers als beoordelingen van Google voor een eerlijk beeld van de ervaring bij ${saunaName}.`,
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <h2 className="font-serif text-xl font-semibold mb-4">Veelgestelde vragen over {saunaName}</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-sm">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default SaunaFAQ;
