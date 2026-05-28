import { notFound } from "next/navigation";
import { getRestaurantBySlug, getOpeningHours, getExceptionalHours } from "@/lib/api";
import { RestaurantProvider } from "@/contexts/restaurant-context";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const [openingHours, exceptionalHours] = await Promise.all([
    getOpeningHours(restaurant.id),
    getExceptionalHours(restaurant.id),
  ]);

  return (
    <RestaurantProvider restaurant={restaurant} slug={slug} openingHours={openingHours} exceptionalHours={exceptionalHours}>
      {children}
    </RestaurantProvider>
  );
}
