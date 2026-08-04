import type { Category, OpeningHour, Restaurant } from "@/types/api";

export const SITE_NAME = "My Spots";

/** URL publique du site, sans slash final. */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");
  return raw.replace(/\/+$/, "");
}

/**
 * L'indexation est refusée par défaut (staging) : il faut poser
 * NEXT_PUBLIC_ENABLE_INDEXING=true sur l'environnement de production.
 */
export function isIndexingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_INDEXING === "true";
}

/** Coupe sur un mot entier pour rester sous la limite d'affichage de Google. */
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > max / 3 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,.;:—-]+$/, "")}…`;
}

function categoryNames(categories: Category[], limit = 4): string[] {
  return [...categories]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((c) => c.name?.trim())
    .filter((name): name is string => Boolean(name))
    .slice(0, limit);
}

function joinFr(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

/**
 * « Chez Mario — Commander en ligne à Lyon | My Spots »
 * Titre gardé court (~60 caractères) pour ne pas être tronqué dans les SERP.
 */
export function buildStoreTitle(restaurant: Restaurant): string {
  const city = restaurant.city?.trim();
  const head = city
    ? `${restaurant.name} — Commander en ligne à ${city}`
    : `${restaurant.name} — Commander en ligne`;
  return truncate(`${head} | ${SITE_NAME}`, 65);
}

/**
 * Meta description générée à partir du restaurant et de sa carte :
 * nom, ville, adresse et principales catégories du menu.
 */
export function buildStoreDescription(
  restaurant: Restaurant,
  categories: Category[] = [],
  max = 160,
): string {
  const city = restaurant.city?.trim();
  let description = truncate(
    city
      ? `Commandez en ligne chez ${restaurant.name} à ${city}.`
      : `Commandez en ligne chez ${restaurant.name}.`,
    max,
  );

  // On n'ajoute une phrase que si elle tient en entier : mieux vaut une
  // description plus courte qu'une phrase coupée au milieu dans les SERP.
  const append = (sentence: string): boolean => {
    if (`${description} ${sentence}`.length > max) return false;
    description = `${description} ${sentence}`;
    return true;
  };

  const names = categoryNames(categories);
  if (names.length > 0) {
    // Retire les catégories une à une jusqu'à ce que la phrase tienne.
    for (let count = names.length; count >= 1; count--) {
      if (append(`Au menu : ${joinFr(names.slice(0, count)).toLowerCase()}.`)) {
        break;
      }
    }
  } else {
    const address = [restaurant.address, restaurant.zipCode]
      .map((v) => v?.trim())
      .filter(Boolean)
      .join(", ");
    if (address) append(`${address}.`);
  }

  // Accroche finale : variante longue si la place le permet, sinon courte.
  for (const cta of [
    "Consultez la carte, commandez et payez en quelques minutes.",
    "Commande et paiement en ligne.",
  ]) {
    if (append(cta)) break;
  }

  return description;
}

const SCHEMA_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** JSON-LD schema.org/Restaurant — permet les rich results (horaires, adresse, tél.). */
export function buildRestaurantJsonLd(
  restaurant: Restaurant,
  openingHours: OpeningHour[] = [],
  categories: Category[] = [],
): Record<string, unknown> {
  const url = `${getSiteUrl()}/store/${restaurant.slug ?? ""}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    url,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      postalCode: restaurant.zipCode,
      addressLocality: restaurant.city,
      addressCountry: "FR",
    },
    acceptsReservations: false,
    potentialAction: {
      "@type": "OrderAction",
      target: url,
    },
  };

  if (restaurant.phone) jsonLd.telephone = restaurant.phone;
  if (restaurant.email) jsonLd.email = restaurant.email;
  if (restaurant.imageUrl) jsonLd.image = restaurant.imageUrl;

  const hours = openingHours
    .filter((h) => SCHEMA_DAYS[h.dayOfWeek] && h.openTime && h.closeTime)
    .map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${SCHEMA_DAYS[h.dayOfWeek]}`,
      opens: h.openTime,
      closes: h.closeTime,
    }));
  if (hours.length > 0) jsonLd.openingHoursSpecification = hours;

  const names = categoryNames(categories, 8);
  if (names.length > 0) {
    jsonLd.hasMenu = {
      "@type": "Menu",
      url,
      hasMenuSection: names.map((name) => ({ "@type": "MenuSection", name })),
    };
  }

  return jsonLd;
}
