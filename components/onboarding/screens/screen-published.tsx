"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Check,
  ExternalLink,
  Eye,
  Loader2,
  Smartphone,
  Store,
} from "lucide-react";
import { publishRestaurant } from "@/lib/api";
import { Button, Eyebrow } from "@/components/onboarding/ui";
import { type WizardBiz } from "./shared";

// ── 8 — Publication & succès ─────────────────────────────────────────────────

const SUCCESS_WRAP =
  "flex-1 flex flex-col items-center justify-center text-center p-14";
const SUCCESS_H1 =
  "font-display-italic italic font-black text-[56px] leading-[0.95] tracking-[-0.02em]";

export function ScreenPublished({
  biz,
  onOpenDashboard,
}: {
  biz: WizardBiz;
  onOpenDashboard: () => void;
}) {
  const [publishing, setPublishing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const slug = biz.slug;
  const storeUrl = slug ? `/store/${slug}` : "#";

  const publish = useCallback(async () => {
    setPublishing(true);
    setError(null);
    const res = await publishRestaurant();
    if (res.error) setError(res.error);
    setPublishing(false);
  }, []);

  useEffect(() => {
    publish();
  }, [publish]);

  if (publishing) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-cream text-brand-ink font-sans">
        <div className="flex-1 flex flex-col gap-4 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-brand-orange" />
          <p className="text-brand-stone">
            Publication de votre établissement…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-cream text-brand-ink font-sans">
        <div className={SUCCESS_WRAP}>
          <Eyebrow>Publication impossible</Eyebrow>
          <h1 className={SUCCESS_H1}>Un instant.</h1>
          <p className="text-principle text-brand-stone mt-3.5 max-w-[48ch]">
            {error}
          </p>
          <div className="flex gap-3.5 mt-7 flex-wrap justify-center">
            <Button size="lg" onClick={publish}>
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-ink font-sans">
      <div className={SUCCESS_WRAP}>
        <div className="w-[92px] h-[92px] rounded-pill bg-brand-forest text-brand-cream flex items-center justify-center mb-7">
          <Check size={44} />
        </div>
        <Eyebrow>Établissement publié</Eyebrow>
        <h1 className={SUCCESS_H1}>Vous êtes en ligne&nbsp;!</h1>
        <p className="text-principle text-brand-stone mt-3.5 max-w-[48ch]">
          Votre page de commande est ouverte au public. Partagez le lien,
          ajoutez-le à votre fiche Google et sur vos réseaux.
        </p>
        <a
          href={storeUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2.5 mt-7 mb-2 px-[22px] py-3.5 bg-white border-[1.5px] border-brand-border rounded-pill text-principle"
        >
          <Store size={18} /> my-spots.fr/store/<b className="font-semibold">{slug}</b>{" "}
          <ExternalLink size={16} className="text-brand-stone" />
        </a>
        <div className="flex gap-3.5 mt-7 flex-wrap justify-center">
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 h-[52px] px-7 rounded-pill text-principle font-semibold tracking-cta whitespace-nowrap border-[1.5px] border-brand-border text-brand-ink hover:border-brand-ink transition-colors cursor-pointer"
          >
            <Eye size={18} /> Voir ma vitrine
          </a>
          <Button size="lg" onClick={onOpenDashboard}>
            <BarChart3 size={18} /> Ouvrir le tableau de bord
          </Button>
        </div>
        <div className="flex items-center gap-2.5 mt-8 px-5 py-3.5 bg-secondary rounded-card text-body-sm">
          <Smartphone size={18} /> Lancez une commande test depuis l&apos;app
          mobile pour vérifier toute la chaîne, de la réception au paiement.
        </div>
      </div>
    </div>
  );
}
