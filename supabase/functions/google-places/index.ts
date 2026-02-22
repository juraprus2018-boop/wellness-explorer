import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('GOOGLE_PLACES_API_KEY is not configured');
    }

    const { action, query, placeId, lat, lng, radius, pageToken } = await req.json();

    // Text search (existing)
    if (action === 'search') {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=sauna+${encodeURIComponent(query)}&language=nl&region=nl&key=${GOOGLE_PLACES_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log('Google Places search status:', data.status, 'results:', (data.results || []).length);

      const results = (data.results || []).map((place: any) => ({
        place_id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        rating: place.rating,
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
      }));

      return new Response(JSON.stringify({ results, next_page_token: data.next_page_token || null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Nearby search with lat/lng/radius + pagination
    if (action === 'nearby') {
      let url: string;
      if (pageToken) {
        // Pagination: only pagetoken + key needed
        url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${encodeURIComponent(pageToken)}&key=${GOOGLE_PLACES_API_KEY}`;
      } else {
        const r = radius || 10000; // default 10km
        url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${r}&keyword=sauna&language=nl&key=${GOOGLE_PLACES_API_KEY}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      console.log('Google Places nearby status:', data.status, 'results:', (data.results || []).length, 'has_next:', !!data.next_page_token);

      const results = (data.results || []).map((place: any) => ({
        place_id: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address,
        rating: place.rating,
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
      }));

      return new Response(JSON.stringify({ results, next_page_token: data.next_page_token || null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Place details (existing)
    if (action === 'details') {
      const fields = 'name,formatted_address,formatted_phone_number,website,opening_hours,geometry,photos,rating,address_components';
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&language=nl&key=${GOOGLE_PLACES_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      const place = data.result;

      if (!place) {
        throw new Error('Place not found');
      }

      let provincie = '';
      let plaatsnaam = '';
      for (const comp of place.address_components || []) {
        if (comp.types.includes('administrative_area_level_1')) {
          provincie = comp.long_name;
        }
        if (comp.types.includes('locality')) {
          plaatsnaam = comp.long_name;
        }
      }

      // Download photos to Supabase Storage
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const saunaSlug = slugify(place.name);
      const plaatsnaamSlug = slugify(plaatsnaam || 'onbekend');
      const storedPhotoUrls: string[] = [];

      const photos = (place.photos || []).slice(0, 10);
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        try {
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`;
          const photoResponse = await fetch(photoUrl);
          if (!photoResponse.ok) {
            console.error(`Failed to download photo ${i}:`, photoResponse.status);
            continue;
          }
          const photoBuffer = await photoResponse.arrayBuffer();
          const contentType = photoResponse.headers.get('content-type') || 'image/jpeg';
          const ext = contentType.includes('png') ? 'png' : 'jpg';
          const fileName = `${saunaSlug}-${plaatsnaamSlug}/${saunaSlug}-${plaatsnaamSlug}-${i + 1}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from('sauna-photos')
            .upload(fileName, photoBuffer, { contentType, upsert: true });

          if (uploadError) {
            console.error(`Failed to upload photo ${i}:`, uploadError.message);
            continue;
          }

          const { data: publicUrlData } = supabase.storage
            .from('sauna-photos')
            .getPublicUrl(fileName);

          storedPhotoUrls.push(publicUrlData.publicUrl);
          console.log(`Photo ${i + 1} stored: ${fileName}`);
        } catch (photoErr) {
          console.error(`Error processing photo ${i}:`, photoErr);
        }
      }

      const details = {
        name: place.name,
        address: place.formatted_address,
        phone: place.formatted_phone_number || null,
        website: place.website || null,
        opening_hours: place.opening_hours?.weekday_text || null,
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
        photo_urls: storedPhotoUrls,
        rating: place.rating,
        provincie,
        plaatsnaam,
      };

      return new Response(JSON.stringify({ details }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action. Use "search", "nearby", or "details".');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Google Places API error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
