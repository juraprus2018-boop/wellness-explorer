
-- Table to store Google Ads configuration per section
CREATE TABLE public.ad_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  section_label text NOT NULL,
  ad_slot text DEFAULT '',
  ad_client text DEFAULT '',
  is_active boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ad_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read ad settings (needed for frontend rendering)
CREATE POLICY "Anyone can view ad settings"
ON public.ad_settings FOR SELECT
USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert ad settings"
ON public.ad_settings FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update ad settings"
ON public.ad_settings FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete ad settings"
ON public.ad_settings FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_ad_settings_updated_at
BEFORE UPDATE ON public.ad_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default sections
INSERT INTO public.ad_settings (section_key, section_label) VALUES
  ('homepage_top', 'Homepage - Boven'),
  ('homepage_bottom', 'Homepage - Onder'),
  ('province_page', 'Provincie pagina'),
  ('city_page', 'Plaats pagina'),
  ('detail_page_top', 'Detail pagina - Boven'),
  ('detail_page_bottom', 'Detail pagina - Onder'),
  ('top10_page', 'Top 10 pagina'),
  ('map_page', 'Kaart pagina');
