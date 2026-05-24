import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export default function RequireCvAuth({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const [state, setState] = useState<{ loading: boolean; session: Session | null }>({
    loading: true,
    session: null,
  });

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setState({ loading: false, session });
    });
    supabase.auth.getSession().then(({ data }) => setState({ loading: false, session: data.session }));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper font-dm text-sm text-ink/55">
        Checking your session…
      </div>
    );
  }

  if (!state.session) {
    return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
  }

  return <>{children}</>;
}
