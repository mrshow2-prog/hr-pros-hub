import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface State {
  loading: boolean;
  session: Session | null;
  isAdmin: boolean;
}

export function useAuthSession(): State {
  const [state, setState] = useState<State>({ loading: true, session: null, isAdmin: false });

  useEffect(() => {
    let mounted = true;

    const refresh = async (session: Session | null) => {
      if (!session) {
        if (mounted) setState({ loading: false, session: null, isAdmin: false });
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (mounted) setState({ loading: false, session, isAdmin: !!data });
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      refresh(session);
    });
    supabase.auth.getSession().then(({ data }) => refresh(data.session));

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
