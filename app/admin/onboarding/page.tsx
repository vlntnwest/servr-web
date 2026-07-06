"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getRestaurant, setRestaurantId, updateOnboardingStep } from "@/lib/api";
import {
  ONBOARDING_STEPS,
  FIRST_WIZARD_STEP,
  LAST_WIZARD_STEP,
  ACTIVATION_ITEMS,
} from "@/lib/onboarding";
import { ChecklistFab } from "@/components/onboarding/primitives";
import {
  ScreenReveal,
  ScreenIdentite,
  ScreenHoraires,
  ScreenMenu,
  ScreenFinalPreview,
  ScreenStripe,
  ScreenPublished,
  type WizardBiz,
} from "@/components/onboarding/screens";

const EMPTY_BIZ: WizardBiz = {
  name: "",
  address: "",
  zipCode: "",
  city: "",
  phone: "",
  email: "",
  imageUrl: null,
  slug: "",
};

const STEP_TO_ACTIVATION: Record<number, string> = {
  [ONBOARDING_STEPS.IDENTITE]: "identite",
  [ONBOARDING_STEPS.HORAIRES]: "horaires",
  [ONBOARDING_STEPS.MENU]: "menu",
  [ONBOARDING_STEPS.STRIPE]: "paiements",
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<number>(ONBOARDING_STEPS.REVEAL);
  const [restaurantId, setRid] = useState<string | null>(null);
  const ridRef = useRef<string | null>(null);
  const [biz, setBiz] = useState<WizardBiz>(EMPTY_BIZ);
  const [collapsed, setCollapsed] = useState(true);

  // ── Bootstrap: auth + resume point ────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace(`/login?redirect=${encodeURIComponent("/admin/onboarding")}`);
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
      const meRes = await fetch(`${API_URL}/api/v1/user/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!meRes.ok) {
        router.replace("/");
        return;
      }
      const { data: me } = await meRes.json();
      if (me.role !== "RESTAURATEUR") {
        router.replace("/");
        return;
      }

      const rid: string | undefined = me.restaurants?.[0]?.id;
      if (!rid) {
        // Pas encore de restaurant : on démarre par la révélation de la vitrine.
        setStep(ONBOARDING_STEPS.REVEAL);
        setReady(true);
        return;
      }

      setRestaurantId(rid);
      setRid(rid);
      ridRef.current = rid;
      const restaurant = await getRestaurant();
      if (restaurant?.isPublished) {
        router.replace(`/admin/${rid}`);
        return;
      }
      if (restaurant) {
        setBiz({
          name: restaurant.name ?? "",
          address: restaurant.address ?? "",
          zipCode: restaurant.zipCode ?? "",
          city: restaurant.city ?? "",
          phone: restaurant.phone ?? "",
          email: restaurant.email ?? "",
          imageUrl: restaurant.imageUrl ?? null,
          slug: restaurant.slug ?? "",
        });
        let resume = Math.min(Math.max(restaurant.onboardingStep ?? FIRST_WIZARD_STEP, FIRST_WIZARD_STEP), LAST_WIZARD_STEP);
        // L'étape MOBILE (app de réception) est retirée du parcours pour le
        // moment : un step 7 persisté reprend directement sur Stripe.
        if (resume === ONBOARDING_STEPS.MOBILE) resume = ONBOARDING_STEPS.STRIPE;
        setStep(resume);
      }
      setReady(true);
    };
    init();
  }, [supabase, router]);

  // ── Step navigation (persisted server-side once the restaurant exists) ──────
  const persist = useCallback((n: number) => {
    if (ridRef.current && n >= FIRST_WIZARD_STEP && n <= ONBOARDING_STEPS.PUBLISHED) {
      updateOnboardingStep(n);
    }
  }, []);

  const go = useCallback(
    (n: number) => {
      setStep(n);
      persist(n);
    },
    [persist],
  );

  // Saut via la checklist : tant que le restaurant n'existe pas, les écrans
  // suivants n'ont rien à charger (spinner infini) — on reste sur Identité.
  const jump = useCallback(
    (n: number) => {
      if (ridRef.current || n <= ONBOARDING_STEPS.IDENTITE) go(n);
    },
    [go],
  );
  const back = useCallback(() => {
    setStep((s) => {
      let n = Math.max(ONBOARDING_STEPS.REVEAL, s - 1);
      // Étape MOBILE retirée du parcours : retour depuis Stripe → aperçu final.
      if (n === ONBOARDING_STEPS.MOBILE) n = ONBOARDING_STEPS.FINAL_PREVIEW;
      persist(n);
      return n;
    });
  }, [persist]);

  const onRestaurantCreated = useCallback((id: string, slug: string) => {
    setRestaurantId(id);
    setRid(id);
    ridRef.current = id;
    setBiz((b) => ({ ...b, slug }));
  }, []);

  // Fin du wizard : on enchaîne directement sur l'écran de publication/succès,
  // sans repasser par une checklist d'activation (tout vient d'être complété).
  const goToPublish = useCallback(() => {
    go(ONBOARDING_STEPS.PUBLISHED);
  }, [go]);

  const openDashboard = useCallback(() => {
    if (restaurantId) router.push(`/admin/${restaurantId}`);
  }, [restaurantId, router]);

  // ── Checklist FAB derivation (linear progress through the wizard) ───────────
  const doneIds = useMemo(() => {
    const d: string[] = [];
    if (step > ONBOARDING_STEPS.IDENTITE || biz.imageUrl) d.push("identite");
    if (step > ONBOARDING_STEPS.HORAIRES) d.push("horaires");
    if (step > ONBOARDING_STEPS.MENU) d.push("menu");
    return d;
  }, [step, biz.imageUrl]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hydrated = Boolean(restaurantId);
  const showChecklist = step >= ONBOARDING_STEPS.IDENTITE && step <= ONBOARDING_STEPS.STRIPE;
  const currentId = STEP_TO_ACTIVATION[step] ?? null;

  return (
    <>
      {step === ONBOARDING_STEPS.REVEAL && <ScreenReveal go={go} back={back} biz={biz} />}
      {step === ONBOARDING_STEPS.IDENTITE && (
        <ScreenIdentite
          go={go}
          back={back}
          biz={biz}
          setBiz={setBiz}
          restaurantId={restaurantId}
          onRestaurantCreated={onRestaurantCreated}
        />
      )}
      {step === ONBOARDING_STEPS.HORAIRES && <ScreenHoraires go={go} back={back} biz={biz} hydrated={hydrated} />}
      {step === ONBOARDING_STEPS.MENU && <ScreenMenu go={go} back={back} hydrated={hydrated} />}
      {step === ONBOARDING_STEPS.FINAL_PREVIEW && <ScreenFinalPreview go={go} back={back} biz={biz} hydrated={hydrated} />}
      {/* Étape MOBILE (ScreenMobile, app de réception) retirée du parcours pour le moment. */}
      {step === ONBOARDING_STEPS.STRIPE && <ScreenStripe back={back} hydrated={hydrated} onFinish={goToPublish} />}
      {step === ONBOARDING_STEPS.PUBLISHED && <ScreenPublished biz={biz} onOpenDashboard={openDashboard} />}

      {showChecklist && (
        <ChecklistFab
          items={ACTIVATION_ITEMS}
          currentId={currentId}
          doneIds={doneIds}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          onJump={jump}
        />
      )}
    </>
  );
}
