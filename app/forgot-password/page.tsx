"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { Loader2 } from "lucide-react";

type Step = "email" | "code" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Étape 1 — envoi du code de réinitialisation par email.
  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    // Message neutre : on passe à l'étape code quoi qu'il arrive (anti-énumération).
    // On ne remonte que les vraies erreurs serveur.
    if (error && error.status && error.status >= 500) {
      setError("Une erreur est survenue. Réessayez plus tard.");
      setLoading(false);
      return;
    }
    setCode("");
    setLoading(false);
    setStep("code");
  };

  // Étape 2 — vérification du code (ouvre une session de récupération).
  const verifyCode = async () => {
    if (loading) return;
    if (code.length < 6) {
      setError("Entrez le code à 6 chiffres reçu par email.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "recovery",
    });
    setLoading(false);
    if (error) {
      setError("Code invalide ou expiré.");
      return;
    }
    setStep("password");
  };

  // Étape 3 — définition du nouveau mot de passe.
  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-brand-border rounded-lg p-6">
          <h1 className="text-xl font-bold mb-4">Mot de passe oublié</h1>

          {step === "email" && (
            <form onSubmit={sendCode} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Entrez votre email : nous vous enverrons un code de
                réinitialisation à 6 chiffres.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Envoyer le code"
                )}
              </Button>
            </form>
          )}

          {step === "code" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyCode();
              }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Entrez le code à 6 chiffres envoyé à{" "}
                <span className="font-medium text-foreground">{email}</span>.
              </p>
              <div className="space-y-1.5">
                <Label>Code de vérification</Label>
                <OtpInput
                  value={code}
                  onChange={setCode}
                  autoFocus
                  onComplete={verifyCode}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Vérifier le code"
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep("email");
                }}
                className="w-full text-center text-sm text-muted-foreground underline"
              >
                Changer d&apos;email
              </button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={resetPassword} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Code vérifié. Choisissez votre nouveau mot de passe.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirmer</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-4">
            <Link href="/login" className="underline">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
