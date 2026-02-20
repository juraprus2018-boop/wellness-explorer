
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: only admins can read user_roles
CREATE POLICY "Admins can view roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Saunas table
CREATE TABLE public.saunas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  address TEXT,
  provincie TEXT NOT NULL,
  plaatsnaam TEXT NOT NULL,
  provincie_slug TEXT NOT NULL,
  plaatsnaam_slug TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  opening_hours JSONB,
  google_place_id TEXT UNIQUE,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  photo_urls TEXT[] DEFAULT '{}',
  average_rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  top10_position INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saunas ENABLE ROW LEVEL SECURITY;

-- Public can read saunas
CREATE POLICY "Anyone can view saunas"
  ON public.saunas FOR SELECT
  USING (true);

-- Only admins can insert/update/delete saunas
CREATE POLICY "Admins can insert saunas"
  ON public.saunas FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update saunas"
  ON public.saunas FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete saunas"
  ON public.saunas FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for URL lookups
CREATE INDEX idx_saunas_slug ON public.saunas (provincie_slug, plaatsnaam_slug, slug);
CREATE INDEX idx_saunas_provincie ON public.saunas (provincie_slug);
CREATE INDEX idx_saunas_top10 ON public.saunas (top10_position) WHERE top10_position IS NOT NULL;

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sauna_id UUID REFERENCES public.saunas(id) ON DELETE CASCADE NOT NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- Anyone can insert reviews (no account needed)
CREATE POLICY "Anyone can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

-- Admins can delete reviews
CREATE POLICY "Admins can delete reviews"
  ON public.reviews FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to update average rating
CREATE OR REPLACE FUNCTION public.update_sauna_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.saunas
  SET
    average_rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM public.reviews WHERE sauna_id = COALESCE(NEW.sauna_id, OLD.sauna_id)
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews WHERE sauna_id = COALESCE(NEW.sauna_id, OLD.sauna_id)
    )
  WHERE id = COALESCE(NEW.sauna_id, OLD.sauna_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_sauna_rating();

-- Updated_at trigger for saunas
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_saunas_updated_at
  BEFORE UPDATE ON public.saunas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
