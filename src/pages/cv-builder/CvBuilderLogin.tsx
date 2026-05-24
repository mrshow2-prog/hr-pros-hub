import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import SEO from "@/components/seo/SEO";

export default function CvBuilderLogin() {
  const nav = useNavigate();
  const loc = useLocation();
  const redirectTo = (loc.state as { from?: string } | null)?.from ?? "/my-cvs";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav(redirectTo, { replace: true });
    });
  }, [nav, redirectTo]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/my-cvs` },
        });
        if (error) throw error;
        toast.success("Account created. Check your inbox to verify, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav(redirectTo, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 font-dm text-ink">
      <SEO
        title="Sign in · People.Studio CV Builder"
        description="Sign in to your People Studio CV Builder account to save drafts, edit them later, and download ATS-optimised PDF CVs tailored to each role."
        path="/login"
      />
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 border border-ink/10 rounded-lg p-6 bg-white">
        <div>
          <h1 className="text-2xl font-semibold">{mode === "signin" ? "Sign in" : "Create account"}</h1>
          <p className="text-sm text-ink/60 mt-1">Save your drafts and come back any time.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
        </Button>
        <button
          type="button"
          className="text-sm text-ink/60 hover:text-ink w-full"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
