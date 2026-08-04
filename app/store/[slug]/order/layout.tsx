import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Votre commande | ${SITE_NAME}`,
  description: "Suivi de votre commande en ligne.",
  robots: { index: false, follow: false },
};

export default function StoreOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
