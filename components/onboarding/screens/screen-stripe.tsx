"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  Clock,
  CreditCard,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { getStripeStatus, initiateStripeOnboarding } from "@/lib/api";
import {
  AppBar,
  Button,
  Chip,
  ChipDot,
  Eyebrow,
} from "@/components/onboarding/ui";
import { type NavProps } from "./shared";

// ── 8 — Stripe Connect ─────────────────────────────────────────────────────────

type StripeState = "none" | "pending" | "enabled";

export function ScreenStripe({
  back,
  hydrated,
  onFinish,
}: Pick<NavProps, "back"> & { hydrated: boolean; onFinish: () => void }) {
  const [st, setSt] = useState<StripeState>("none");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const refresh = async () => {
    const res = await getStripeStatus();
    if (res.data) {
      if (res.data.chargesEnabled) setSt("enabled");
      else if (res.data.connected) setSt("pending");
      else setSt("none");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (hydrated) refresh();
  }, [hydrated]);

  const connect = async () => {
    setConnecting(true);
    const res = await initiateStripeOnboarding();
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      setConnecting(false);
    }
  };

  const states: {
    id: StripeState;
    icon: React.ReactNode;
    lbl: string;
    sub: string;
  }[] = [
    {
      id: "none",
      icon: <CreditCard size={20} />,
      lbl: "Non connecté",
      sub: "Connectez votre compte pour encaisser.",
    },
    {
      id: "pending",
      icon: <Clock size={20} />,
      lbl: "En attente de validation Stripe",
      sub: "Vos informations sont en cours de vérification.",
    },
    {
      id: "enabled",
      icon: <CheckCircle size={20} />,
      lbl: "Paiements activés",
      sub: "Vous pouvez recevoir des commandes payées.",
    },
  ];
  const tone: Record<StripeState, { bg: string; c: string }> = {
    none: { bg: "var(--color-secondary)", c: "var(--color-brand-stone)" },
    pending: { bg: "rgba(240,192,48,.25)", c: "#7a5e08" },
    enabled: { bg: "rgba(168,208,64,.28)", c: "var(--color-brand-forest)" },
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-ink font-sans">
      <AppBar step="Passer en ligne" />
      <div className="flex-1 overflow-y-auto flex flex-col items-center p-14">
        <div className="text-center max-w-[60ch] mx-auto mb-7">
          <Eyebrow>Paiements</Eyebrow>
          <h1 className="font-display text-display tracking-tight mt-2.5 mb-2">
            Recevez vos paiements
          </h1>
          <p className="text-principle text-brand-stone">
            Dernière étape avant de passer en ligne. Vos clients paient en
            ligne, vous êtes réglé directement.
          </p>
        </div>

        <div className="w-[min(720px,100%)] bg-white border-[1.5px] border-brand-border rounded-card overflow-hidden flex-none">
          <div className="p-8 border-b-[1.5px] border-brand-border flex gap-[18px] items-center">
            <span className="w-14 h-14 rounded-icon bg-brand-ink text-brand-cream flex items-center justify-center flex-none">
              <Wallet size={26} />
            </span>
            <div className="flex-1">
              <div className="font-display-italic italic font-black text-[24px]">
                Paiements sécurisés par Stripe
              </div>
              <div className="text-brand-stone text-[14px] mt-1">
                Le leader mondial du paiement en ligne. Cartes, Apple&nbsp;Pay,
                Google&nbsp;Pay.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5 px-8 py-[22px] bg-brand-orange/[0.06]">
            <span className="font-display text-[48px] text-brand-orange leading-none">
              5 %
            </span>
            <div>
              <div>
                <b className="font-semibold">Par commande, c&apos;est tout.</b>
              </div>
              <div className="text-brand-stone text-[14px]">
                Aucun abonnement, aucun frais fixe, aucun engagement. Vous ne
                payez que quand vous vendez.
              </div>
            </div>
          </div>
          <div className="p-7">
            {loading ? (
              <div className="flex justify-center p-3">
                <Loader2 size={24} className="animate-spin text-brand-orange" />
              </div>
            ) : st === "none" ? (
              <Button size="lg" block onClick={connect} disabled={connecting}>
                {connecting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <CreditCard size={18} /> Connecter Stripe
                  </>
                )}
              </Button>
            ) : st === "pending" ? (
              <div>
                <Chip tone="warn" className="mb-3.5">
                  <Clock size={13} /> En attente de validation Stripe
                </Chip>
                <Button
                  variant="outline"
                  size="lg"
                  block
                  onClick={refresh}
                  className="mb-2.5"
                >
                  Rafraîchir le statut
                </Button>
                <Button size="lg" block onClick={connect} disabled={connecting}>
                  Continuer la configuration <ArrowRight size={18} />
                </Button>
                <p className="text-brand-stone text-[13px] text-center mt-3">
                  La validation prend généralement quelques minutes.
                </p>
              </div>
            ) : (
              <div>
                <Chip tone="open" className="mb-3.5">
                  <ChipDot />
                  Paiements activés
                </Chip>
                <Button size="lg" block onClick={onFinish}>
                  Mettre mon établissement en ligne <ArrowRight size={18} />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-body-sm text-brand-stone mt-5">
              <ShieldCheck size={16} /> Vos coordonnées bancaires sont gérées
              par Stripe — jamais stockées chez nous.
            </div>

            {!loading && st !== "enabled" && (
              <div className="mt-5 pt-5 border-t-[1.5px] border-brand-border text-center">
                <Button variant="outline" block onClick={onFinish}>
                  Configurer les paiements plus tard
                </Button>
                <p className="text-brand-stone text-[13px] mt-1.5">
                  Votre vitrine sera publiée, mais elle ne pourra pas recevoir
                  de commandes tant que Stripe n&apos;est pas activé. Vous
                  pourrez le faire à tout moment dans les réglages.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="w-[min(720px,100%)] mt-6 grid gap-3 flex-none">
          {states.map((s) => {
            const active = s.id === st;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-4 px-5 py-[18px] border-[1.5px] rounded-card bg-white ${
                  active
                    ? "border-brand-orange shadow-[0_0_0_3px_rgba(232,82,28,0.16)]"
                    : "border-brand-border"
                }`}
                style={active ? undefined : { opacity: 0.55 }}
              >
                <span
                  className="w-11 h-11 rounded-pill flex items-center justify-center flex-none"
                  style={{ background: tone[s.id].bg, color: tone[s.id].c }}
                >
                  {s.icon}
                </span>
                <div className="flex-1">
                  <div className="font-semibold">{s.lbl}</div>
                  <div className="text-body-sm text-brand-stone">{s.sub}</div>
                </div>
                {active && <Chip tone="orange">État actuel</Chip>}
              </div>
            );
          })}
        </div>
        <div className="mt-6">
          <Button variant="ghost" onClick={back}>
            <ChevronLeft size={18} /> Retour
          </Button>
        </div>
      </div>
    </div>
  );
}
