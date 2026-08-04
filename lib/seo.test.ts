import { describe, it, expect } from "vitest";
import {
  buildRestaurantJsonLd,
  buildStoreDescription,
  buildStoreTitle,
  truncate,
} from "./seo";
import type { Category, OpeningHour, Restaurant } from "@/types/api";

const restaurant: Restaurant = {
  id: "r1",
  name: "Chez Mario",
  slug: "chez-mario",
  address: "12 rue de la Paix",
  zipCode: "69001",
  city: "Lyon",
  phone: "0400000000",
  email: "contact@chez-mario.fr",
  imageUrl: "https://cdn.example.com/mario.jpg",
  siret: null,
  vatNumber: null,
  preparationLevel: "EASY",
  isOpen: true,
  isReady: true,
  isPublished: true,
  onboardingStep: 5,
  autoOpen: true,
  timezone: "Europe/Paris",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

function category(name: string, displayOrder: number): Category {
  return {
    id: name,
    restaurantId: "r1",
    name,
    subHeading: null,
    displayOrder,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    productCategories: [],
  };
}

describe("truncate", () => {
  it("laisse un texte court intact", () => {
    expect(truncate("Bonjour", 20)).toBe("Bonjour");
  });
  it("coupe sur un mot entier et ajoute une ellipse", () => {
    const out = truncate("un deux trois quatre cinq six sept huit", 20);
    expect(out.length).toBeLessThanOrEqual(20);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toContain("  ");
  });
});

describe("buildStoreTitle", () => {
  it("compose nom, ville et marque", () => {
    expect(buildStoreTitle(restaurant)).toBe(
      "Chez Mario — Commander en ligne à Lyon | My Spots",
    );
  });
  it("omet la ville si absente", () => {
    const title = buildStoreTitle({ ...restaurant, city: "" });
    expect(title).toBe("Chez Mario — Commander en ligne | My Spots");
  });
  it("reste sous 65 caractères", () => {
    const title = buildStoreTitle({
      ...restaurant,
      name: "Le Restaurant Du Vieux Port Et De La Grande Rue Ensoleillée",
    });
    expect(title.length).toBeLessThanOrEqual(65);
  });
});

describe("buildStoreDescription", () => {
  const categories = [
    category("Desserts", 3),
    category("Burgers", 1),
    category("Salades", 2),
  ];

  it("mentionne le restaurant, la ville et les catégories dans l'ordre d'affichage", () => {
    const desc = buildStoreDescription(restaurant, categories);
    expect(desc).toContain("Chez Mario");
    expect(desc).toContain("Lyon");
    expect(desc).toContain("Au menu : burgers, salades et desserts.");
  });

  it("retombe sur l'adresse quand la carte est vide", () => {
    const desc = buildStoreDescription(restaurant, []);
    expect(desc).toContain("12 rue de la Paix, 69001");
  });

  it("ne dépasse jamais 160 caractères et ne coupe pas une phrase", () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      category(`Catégorie très longue numéro ${i}`, i),
    );
    const desc = buildStoreDescription(restaurant, many);
    expect(desc.length).toBeLessThanOrEqual(160);
    expect(desc.endsWith(".")).toBe(true);
    expect(desc).toContain("Chez Mario");
  });

  it("garde la phrase d'accroche même si tout le reste est écarté", () => {
    const desc = buildStoreDescription(restaurant, categories, 60);
    expect(desc).toBe("Commandez en ligne chez Chez Mario à Lyon.");
  });
});

describe("buildRestaurantJsonLd", () => {
  const openingHours: OpeningHour[] = [
    {
      id: "1",
      restaurantId: "r1",
      dayOfWeek: 1,
      openTime: "11:30",
      closeTime: "14:00",
      order: 0,
    },
    {
      id: "2",
      restaurantId: "r1",
      dayOfWeek: 0,
      openTime: "18:00",
      closeTime: "22:00",
      order: 0,
    },
  ];

  it("produit un schema Restaurant avec adresse et horaires", () => {
    const jsonLd = buildRestaurantJsonLd(restaurant, openingHours, [
      category("Burgers", 1),
    ]);
    expect(jsonLd["@type"]).toBe("Restaurant");
    expect(jsonLd.name).toBe("Chez Mario");
    expect(jsonLd.telephone).toBe("0400000000");
    expect(jsonLd.address).toMatchObject({
      postalCode: "69001",
      addressLocality: "Lyon",
    });
    expect(jsonLd.openingHoursSpecification).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "https://schema.org/Monday",
        opens: "11:30",
        closes: "14:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "https://schema.org/Sunday",
        opens: "18:00",
        closes: "22:00",
      },
    ]);
    expect(jsonLd.hasMenu).toMatchObject({
      hasMenuSection: [{ "@type": "MenuSection", name: "Burgers" }],
    });
  });

  it("omet les champs vides", () => {
    const jsonLd = buildRestaurantJsonLd(
      { ...restaurant, phone: "", email: null, imageUrl: null },
      [],
      [],
    );
    expect(jsonLd.telephone).toBeUndefined();
    expect(jsonLd.email).toBeUndefined();
    expect(jsonLd.image).toBeUndefined();
    expect(jsonLd.openingHoursSpecification).toBeUndefined();
    expect(jsonLd.hasMenu).toBeUndefined();
  });
});
