import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdPlaceholderProps {
  sectionKey?: string;
  className?: string;
}

const AdPlaceholder = ({ sectionKey = "default", className = "" }: AdPlaceholderProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  const { data: adSetting } = useQuery({
    queryKey: ["ad-settings", sectionKey],
    queryFn: async () => {
      const { data } = await supabase
        .from("ad_settings")
        .select("*")
        .eq("section_key", sectionKey)
        .eq("is_active", true)
        .maybeSingle();
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

  // Don't render anything if no active ad setting
  if (!adSetting) return null;

  return (
    <div className={className}>
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

export default AdPlaceholder;
