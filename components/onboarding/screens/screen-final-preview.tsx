"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronLeft } from "lucide-react";
import { getMenuAdmin } from "@/lib/api";
import {
  StorefrontPreview,
  type PreviewCategory,
} from "@/components/onboarding/primitives";
import { Button, WizardFoot } from "@/components/onboarding/ui";
import {
  type NavProps,
  type WizardBiz,
  previewCategoriesFromMenu,
  todayHoursLabel,
} from "./shared";

// ── 6 — Aperçu final ─────────────────────────────────────────────────────────

export function ScreenFinalPreview({
  go,
  back,
  biz,
  hydrated,
}: NavProps & { biz: WizardBiz; hydrated: boolean }) {
  const [cats, setCats] = useState<PreviewCategory[]>([]);
  useEffect(() => {
    if (hydrated)
      getMenuAdmin().then((m) => setCats(previewCategoriesFromMenu(m)));
  }, [hydrated]);
  const r = { ...biz, todayHours: todayHoursLabel() };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-ink font-sans">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto">
          <div className="bg-brand-ink text-brand-cream px-7 py-[18px] flex items-center gap-4">
            <span className="w-10 h-10 rounded-pill bg-brand-orange/[0.25] text-brand-orange flex items-center justify-center flex-none">
              <Check size={20} />
            </span>
            <div className="flex-1">
              <div className="font-display-italic italic font-black text-[22px]">
                Voilà votre vitrine.
              </div>
              <div className="text-brand-cream/70 text-[14px]">
                Exactement ce que verront vos clients. Il reste une étape :
                recevoir vos paiements.
              </div>
            </div>
          </div>
          <StorefrontPreview
            r={r}
            categories={
              cats.length ? cats : [{ id: "x", name: "Menu", products: [] }]
            }
            placeholder={cats.length === 0}
          />
          <div className="h-10" />
        </div>
      </div>
      <WizardFoot>
        <Button variant="ghost" onClick={back}>
          <ChevronLeft size={18} /> Retour au menu
        </Button>
        <Button size="lg" onClick={() => go(8)}>
          Passer en ligne <ArrowRight size={18} />
        </Button>
      </WizardFoot>
    </div>
  );
}
