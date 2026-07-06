"use client";

import { ArrowRight } from "lucide-react";
import { StorefrontPreview } from "@/components/onboarding/primitives";
import { Button, Eyebrow } from "@/components/onboarding/ui";
import { type NavProps, type WizardBiz, todayHoursLabel } from "./shared";

// ── 2 — Reveal ───────────────────────────────────────────────────────────────

export function ScreenReveal({ go, biz }: NavProps & { biz: WizardBiz }) {
  const r = { ...biz, todayHours: todayHoursLabel() };
  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-ink font-sans">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 relative overflow-y-auto">
          <div className="[filter:saturate(.96)]">
            <StorefrontPreview
              r={r}
              categories={[{ id: "x", name: "Menu", products: [] }]}
              placeholder
            />
          </div>
          <div className="absolute inset-0 flex items-end justify-center pb-12 z-10 bg-[linear-gradient(0deg,rgba(26,26,26,0.55)_0%,rgba(26,26,26,0.05)_45%,transparent_70%)]">
            <div className="bg-brand-cream rounded-card shadow-modal px-8 py-7 w-[min(620px,92%)] text-center">
              <Eyebrow>Voici votre page</Eyebrow>
              <h2 className="font-display-italic italic font-black text-[30px] my-2">
                Configurons-la ensemble.
              </h2>
              <p className="text-brand-stone max-w-[44ch] mx-auto mb-[22px]">
                Votre vitrine existe déjà. En quelques étapes, on la remplit
                avec votre identité, vos horaires et votre menu — puis on passe
                en ligne.
              </p>
              <Button size="lg" onClick={() => go(3)}>
                Configurer ma page <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
