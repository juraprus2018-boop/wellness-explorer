

# Saunaboeken.com - Recreatie in Lovable

## Overzicht
Een warm en uitnodigend sauna/wellness platform voor Nederland, met een admin dashboard, review systeem, en Google Places API integratie. Backend via Lovable Cloud (Supabase).

---

## 1. Database & Backend Setup (Lovable Cloud)
- **Saunas tabel**: naam, beschrijving, adres, provincie, plaatsnaam, slug, telefoon, website, openingstijden, Google Place ID, coördinaten (lat/lng), foto URLs, gemiddelde rating, top-10 positie
- **Reviews tabel**: sauna_id, naam reviewer, email, rating (1-5), tekst, datum
- **Admin authenticatie**: login voor beheer via Supabase Auth
- **Edge function**: Google Places API aanroepen voor het ophalen van sauna data (foto's, reviews, details)

## 2. URL Structuur & Pagina's

### Publieke pagina's:
- **`/`** — Homepage met hero, zoekbalk, top saunas, provincies overzicht
- **`/sauna/{provincie}`** — Overzicht van alle plaatsen met saunas in een provincie
- **`/sauna/{provincie}/{plaatsnaam}`** — Alle saunas in een specifieke plaats
- **`/sauna/{provincie}/{plaatsnaam}/{sauna-slug}`** — Detail pagina met foto's, beschrijving, openingstijden, telefoon, CTA naar website, reviews, en review formulier
- **`/de-beste-saunas-van-nederland`** — Top 10 pagina (beheerd door admin)
- **`/kaart`** — Interactieve Leaflet/OpenStreetMap kaart met alle wellness locaties

### Admin pagina's:
- **`/admin/login`** — Admin inloggen
- **`/admin/dashboard`** — Overzicht van alle saunas
- **`/admin/saunas/toevoegen`** — Sauna toevoegen via Google Places API (zoek op naam/adres, selecteer, data downloaden)
- **`/admin/top-10`** — Top 10 saunas beheren (drag & drop volgorde)

## 3. Design — Warm & Uitnodigend
- Warme aardse kleuren (terracotta, warm beige, zacht bruin)
- Grote sfeervolle foto's op detail pagina's
- Afgeronde hoeken, zachte schaduwen
- Duidelijke CTA-knoppen voor website bezoek
- Responsive design voor mobiel en desktop

## 4. Kernfunctionaliteiten

### Sauna Detail Pagina
- Fotogalerij/carousel
- Beschrijving, adres, openingstijden
- Telefoonnummer + klikbaar
- CTA knop naar website
- Gemiddelde rating met sterren
- Reviews van gebruikers
- Review formulier (naam, email, rating, tekst — geen account nodig)

### Kaart (Leaflet/OpenStreetMap)
- Alle saunas als markers
- Klik op marker → popup met naam, rating, link naar detail
- Filteren per provincie

### Review Systeem
- Naam + email + rating (sterren) + tekst
- Geen account nodig
- Gemiddelde rating wordt automatisch berekend

### Google Places API Integratie
- Edge function voor het ophalen van plaats-details
- Admin zoekt sauna op naam → selecteert → data wordt opgeslagen (naam, adres, foto's, openingstijden, telefoon, website)
- Foto's worden als URLs opgeslagen

## 5. Google Ads Ruimtes
- Advertentie-blokken op strategische plekken:
  - Homepage (boven en onder content)
  - Provincie/plaats overzichtspagina's (tussen listings)
  - Detail pagina (sidebar of onder beschrijving)
  - Top 10 pagina (tussen items)
- Placeholder componenten die je later kunt vullen met Google AdSense code

## 6. Fasering
**Fase 1**: Database setup, design systeem, homepage, basis routing
**Fase 2**: Admin dashboard met login, sauna toevoegen via Places API
**Fase 3**: Publieke pagina's (provincie, plaats, detail)
**Fase 4**: Review systeem, kaart, top 10 pagina
**Fase 5**: Google Ads placeholders, afwerking

