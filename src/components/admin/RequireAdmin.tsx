import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import RequireCvAuth from "@/components/cv-builder/RequireCvAuth";

export default function RequireAdmin({ children }: { children: ReactNode }) {
  return (
    <RequireCvAuth>
      <AdminGate>{children}</AdminGate>
    </RequireCvAuth>
  );
}

function AdminGate({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useIsAdmin();
  if (loading) {
    return (
      <div className="min-h-screen bg-paper text-ink font-dm flex items-center justify-center">
        <p className="text-sm text-ink/55">Checking access…</p>
      </div>
    );
  }
  if (!isAdmin) return <Navigate to="/my-cvs" replace />;
  return <>{children}</>;
}
