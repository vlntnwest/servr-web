import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getRestaurantBySlug,
  getMenuForRestaurant,
  getOpeningHours,
} from "@/lib/api";
import Header from "@/components/layout/header";
import RestaurantHeader from "@/components/store/restaurant-header";
import CategoryNav from "@/components/menu/category-nav";
import MenuPage from "@/components/menu/menu-page";
import { CategorySectionSkeleton } from "@/components/menu/category-section";
import { Suspense } from "react";
import {
  SITE_NAME,
  buildRestaurantJsonLd,
  buildStoreDescription,
  buildStoreTitle,
  getSiteUrl,
  isIndexingEnabled,
} from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return {
      title: `Restaurant introuvable | ${SITE_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const categories = await getMenuForRestaurant(restaurant.id);
  const title = buildStoreTitle(restaurant);
  const description = buildStoreDescription(restaurant, categories);
  const url = `${getSiteUrl()}/store/${slug}`;
  const indexable = isIndexingEnabled() && restaurant.isPublished;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: SITE_NAME,
      title,
      description,
      url,
      ...(restaurant.imageUrl
        ? { images: [{ url: restaurant.imageUrl, alt: restaurant.name }] }
        : {}),
    },
    twitter: {
      card: restaurant.imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(restaurant.imageUrl ? { images: [restaurant.imageUrl] } : {}),
    },
  };
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const [categories, openingHours] = await Promise.all([
    getMenuForRestaurant(restaurant.id),
    getOpeningHours(restaurant.id),
  ]);
  const sorted = [...categories].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  const jsonLd = buildRestaurantJsonLd(restaurant, openingHours, sorted);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <RestaurantHeader openingHours={openingHours} />
      <CategoryNav categories={sorted} />
      <main>
        <Suspense
          fallback={
            <div>
              {[1, 2, 3].map((i) => (
                <CategorySectionSkeleton key={i} />
              ))}
            </div>
          }
        >
          <MenuPage categories={sorted} />
        </Suspense>
      </main>
    </>
  );
}
