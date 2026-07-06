// Étapes du wizard (mêmes numéros que le prototype docs/superpowers/onboarding).
export const ONBOARDING_STEPS = {
  INSCRIPTION: 1,
  REVEAL: 2,
  IDENTITE: 3,
  HORAIRES: 4,
  MENU: 5,
  FINAL_PREVIEW: 6,
  MOBILE: 7,
  STRIPE: 8,
  DASHBOARD: 9,
  PUBLISHED: 10,
} as const;

export const FIRST_WIZARD_STEP = ONBOARDING_STEPS.IDENTITE;
export const LAST_WIZARD_STEP = ONBOARDING_STEPS.STRIPE;

export type ActivationId = "identite" | "horaires" | "menu" | "paiements";

export interface ActivationItem {
  id: ActivationId;
  label: string;
  step: number;
}

// Les 4 étapes d'activation affichées dans la checklist flottante (FAB) du wizard.
export const ACTIVATION_ITEMS: ActivationItem[] = [
  { id: "identite", label: "Identité & photo", step: ONBOARDING_STEPS.IDENTITE },
  { id: "horaires", label: "Horaires & retrait", step: ONBOARDING_STEPS.HORAIRES },
  { id: "menu", label: "Menu", step: ONBOARDING_STEPS.MENU },
  { id: "paiements", label: "Passer en ligne", step: ONBOARDING_STEPS.STRIPE },
];

