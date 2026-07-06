"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { becomeRestaurateur } from "@/lib/api";
import { AuthBrandPanel } from "@/components/onboarding/screens";
import { Button, Eyebrow, Field, IconInput } from "@/components/onboarding/ui";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) sessionStorage.setItem("onboardingToken", token);
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Confirmation email activée côté Supabase : pas de session tant que le
    // lien n'est pas cliqué — impossible d'activer le rôle restaurateur ici.
    if (!data.session) {
      setError(
        "Confirmez votre adresse email via le lien qui vient de vous être envoyé, puis connectez-vous.",
      );
      setLoading(false);
      return;
    }
    const res = await becomeRestaurateur();
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
    router.replace("/admin/onboarding");
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-ink font-sans">
      <div className="flex-1 grid min-h-0 grid-cols-[1fr] min-[900px]:grid-cols-[1.05fr_0.95fr]">
        <AuthBrandPanel />

        <div className="flex items-center justify-center p-14">
          <div className="w-full max-w-[400px]">
            <Eyebrow>Créer un compte</Eyebrow>
            <h1 className="font-display text-display-sm tracking-tight mt-2.5 mb-2">
              Commençons.
            </h1>
            <p className="text-brand-stone mb-7">
              Juste votre email et un mot de passe. Le reste vient après.
            </p>

            <form onSubmit={handleRegister}>
              <Field label="Email">
                <IconInput
                  icon={<Mail size={18} />}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@restaurant.fr"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field label="Mot de passe">
                <IconInput
                  icon={<Lock size={18} />}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 caractères minimum"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </Field>

              {error && (
                <p className="text-brand-maroon text-[14px]">{error}</p>
              )}

              <Button size="lg" block className="mt-2" disabled={loading}>
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Créer mon compte <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

            <p className="text-brand-stone text-center mt-[18px] text-[13px]">
              Déjà un compte ?{" "}
              <Link
                href="/login"
                className="text-brand-orange font-semibold"
              >
                Se connecter
              </Link>
            </p>
            <p className="text-brand-stone text-center mt-[22px] text-[12px] leading-[1.5]">
              En continuant, vous acceptez les conditions d&apos;utilisation et
              la politique de confidentialité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterRestaurateurPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
