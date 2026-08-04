import type { MetadataRoute } from "next";
import { getSiteUrl, isIndexingEnabled } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Tant que NEXT_PUBLIC_ENABLE_INDEXING n'est pas posé (staging, previews),
  // on bloque tous les robots — comportement identique à l'ancien robots.txt.
  if (!isIndexingEnabled()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/back-office",
        "/account",
        "/login",
        "/register",
        "/forgot-password",
        "/auth/",
        "/store/*/order/",
      ],
    },
    host: getSiteUrl(),
  };
}
