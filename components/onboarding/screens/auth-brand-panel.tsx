import { Clock, CreditCard, ShoppingBag } from "lucide-react";
import { Logo } from "@/components/onboarding/primitives";

// ── Panneau d'inscription (réutilisé par /register/restaurateur) ────────────────

export function AuthBrandPanel() {
  return (
    <div className="hidden min-[900px]:flex flex-col justify-between gap-8 bg-brand-ink text-brand-cream p-14">
      <Logo light size={30} />
      <div>
        <h2 className="font-display-italic italic font-black text-brand-cream text-[44px] leading-[0.95] tracking-[-0.02em]">
          Votre vitrine en ligne,
          <br />
          prête en un service.
        </h2>
        <p className="text-principle text-brand-cream/70 max-w-[32ch] mt-[18px]">
          Créez votre page de commande, gérez votre menu et vos paiements depuis
          un seul endroit.
        </p>
        <ul className="flex flex-col gap-3.5 list-none p-0 mt-9">
          <li className="flex items-center gap-3 text-body text-brand-cream/85">
            <span className="w-9 h-9 rounded-pill bg-brand-orange/[0.22] text-brand-orange flex items-center justify-center flex-none">
              <ShoppingBag size={18} />
            </span>
            Votre page de click &amp; collect, à votre nom
          </li>
          <li className="flex items-center gap-3 text-body text-brand-cream/85">
            <span className="w-9 h-9 rounded-pill bg-brand-orange/[0.22] text-brand-orange flex items-center justify-center flex-none">
              <CreditCard size={18} />
            </span>
            Sans abonnement · 5 % par commande, c&apos;est tout
          </li>
          <li className="flex items-center gap-3 text-body text-brand-cream/85">
            <span className="w-9 h-9 rounded-pill bg-brand-orange/[0.22] text-brand-orange flex items-center justify-center flex-none">
              <Clock size={18} />
            </span>
            En pause quand vous voulez, on garde votre progression
          </li>
        </ul>
      </div>
      <div className="text-brand-cream/45 text-[13px]">
        Déjà de nombreux établissements en France
      </div>
    </div>
  );
}
