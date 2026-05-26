"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Restaurant, OpeningHour } from "@/types/api";

type RestaurantContextType = {
  restaurant: Restaurant;
  slug: string;
  openingHours: OpeningHour[];
  updateRestaurant: (r: Restaurant) => void;
};

const RestaurantContext = createContext<RestaurantContextType | null>(null);

export function RestaurantProvider({
  restaurant: initialRestaurant,
  slug,
  openingHours,
  children,
}: {
  restaurant: Restaurant;
  slug: string;
  openingHours: OpeningHour[];
  children: ReactNode;
}) {
  const [restaurant, setRestaurant] = useState(initialRestaurant);

  return (
    <RestaurantContext.Provider value={{ restaurant, slug, openingHours, updateRestaurant: setRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error("useRestaurant must be used within RestaurantProvider");
  return ctx;
}

export function useOptionalRestaurant() {
  return useContext(RestaurantContext);
}
