import type { Category } from "@/types/api";
import type { PreviewCategory } from "@/components/onboarding/primitives";

// ── Données partagées du wizard ─────────────────────────────────────────────────

export interface WizardBiz {
  name: string;
  address: string;
  zipCode: string;
  city: string;
  phone: string;
  email: string;
  imageUrl: string | null;
  slug: string;
}

export interface NavProps {
  go: (n: number) => void;
  back: () => void;
}

// Lundi=1 … Samedi=6, Dimanche=0 (convention OpeningHour.dayOfWeek)
export const DEFAULT_DAYS: {
  dow: number;
  label: string;
  open: boolean;
  ranges: [string, string][];
}[] = [
  {
    dow: 1,
    label: "Lundi",
    open: true,
    ranges: [
      ["11:30", "14:30"],
      ["18:30", "22:00"],
    ],
  },
  {
    dow: 2,
    label: "Mardi",
    open: true,
    ranges: [
      ["11:30", "14:30"],
      ["18:30", "22:00"],
    ],
  },
  {
    dow: 3,
    label: "Mercredi",
    open: true,
    ranges: [
      ["11:30", "14:30"],
      ["18:30", "22:00"],
    ],
  },
  {
    dow: 4,
    label: "Jeudi",
    open: true,
    ranges: [
      ["11:30", "14:30"],
      ["18:30", "22:00"],
    ],
  },
  {
    dow: 5,
    label: "Vendredi",
    open: true,
    ranges: [
      ["11:30", "14:30"],
      ["18:30", "23:00"],
    ],
  },
  { dow: 6, label: "Samedi", open: true, ranges: [["12:00", "23:00"]] },
  { dow: 0, label: "Dimanche", open: false, ranges: [] },
];

export function previewCategoriesFromMenu(menu: Category[]): PreviewCategory[] {
  return menu
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((c) => ({
      id: c.id,
      name: c.name,
      sub: c.subHeading ?? undefined,
      products: (c.productCategories ?? [])
        .map((pc) => pc.product)
        .filter(Boolean)
        .map((p) => ({
          id: p.id,
          name: p.name,
          desc: p.description,
          price: parseFloat(p.price),
          bg: p.imageUrl
            ? `center/cover no-repeat url(${p.imageUrl})`
            : undefined,
          popular: false,
        })),
    }));
}

export function todayHoursLabel(): string {
  const dow = new Date().getDay();
  const day = DEFAULT_DAYS.find((d) => d.dow === dow);
  if (!day || !day.open) return "Fermé aujourd'hui";
  return day.ranges.map((r) => `${r[0]} – ${r[1]}`).join(" / ");
}
