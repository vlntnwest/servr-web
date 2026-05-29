"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { setRestaurantId } from "@/lib/api";
import OrdersTab from "@/components/admin/orders-tab";
import StatsTab from "@/components/admin/stats-tab";
import OpeningHoursTab from "@/components/admin/opening-hours-tab";
import ProductsTab from "@/components/admin/products-tab";
import SettingsTab from "@/components/admin/settings-tab";
import PromoCodesTab from "@/components/admin/promo-codes-tab";

export default function RestaurantDashboard({ restaurantId }: { restaurantId: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRestaurantId(restaurantId);
    setReady(true);
  }, [restaurantId]);

  if (!ready) return null;

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      <Tabs defaultValue="orders">
        <TabsList className="mb-0">
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="hours">Horaires</TabsTrigger>
          <TabsTrigger value="promos">Codes promo</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>
        <TabsContent value="orders"><OrdersTab /></TabsContent>
        <TabsContent value="stats"><StatsTab /></TabsContent>
        <TabsContent value="products"><ProductsTab /></TabsContent>
        <TabsContent value="hours"><OpeningHoursTab /></TabsContent>
        <TabsContent value="promos"><PromoCodesTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
      </Tabs>
    </main>
  );
}
