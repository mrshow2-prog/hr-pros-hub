import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePaywallEnabled() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("paywall_enabled")
        .eq("id", true)
        .maybeSingle();
      if (active) setEnabled(!!data?.paywall_enabled);
    })();
    return () => {
      active = false;
    };
  }, []);

  return enabled;
}
