"use client";

import { use } from "react";
import RestaurantDashboard from "@/components/admin/restaurant-dashboard";

export default function BackOfficeRestaurantPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = use(params);
  return <RestaurantDashboard restaurantId={restaurantId} />;
}
