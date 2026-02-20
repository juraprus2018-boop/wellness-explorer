
-- Create storage bucket for sauna photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sauna-photos', 'sauna-photos', true);

-- Allow public read access
CREATE POLICY "Public can view sauna photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'sauna-photos');

-- Allow admins to upload sauna photos
CREATE POLICY "Admins can upload sauna photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sauna-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Allow admins to delete sauna photos
CREATE POLICY "Admins can delete sauna photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'sauna-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));
