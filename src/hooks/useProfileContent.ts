import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProfileContent {
  id: string;
  slug: string;
  owner_user_id: string | null;
  seo_title: string;
  seo_description: string;
  og_image_url: string | null;
  content: Record<string, any>;
  published: boolean;
  updated_at: string;
}

export function useProfileContent(slug: string | undefined) {
  return useQuery({
    queryKey: ["profile-content", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles_content")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data as ProfileContent | null;
    },
  });
}
