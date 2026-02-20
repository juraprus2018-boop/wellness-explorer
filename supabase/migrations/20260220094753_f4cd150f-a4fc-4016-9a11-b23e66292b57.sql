
-- Add rate limiting: max 1 review per email per sauna
CREATE UNIQUE INDEX idx_reviews_unique_email_sauna ON public.reviews (sauna_id, reviewer_email);
