import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

interface GoogleAdProps {
  sectionKey: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const GoogleAd = ({ sectionKey, className = "" }: GoogleAdProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  const { data: adSetting } = useQuery({
    queryKey: ["ad-settings", sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_settings")
        .select("*")
        .eq("section_key", sectionKey)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (adSetting && adRef.current && !pushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // adsbygoogle not loaded
      }
    }
  }, [adSetting]);

  if (!adSetting) return null;

  return (
    <div className={`ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adSetting.ad_client}
        data-ad-slot={adSetting.ad_slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default GoogleAd;
