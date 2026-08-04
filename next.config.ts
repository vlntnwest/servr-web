import type { NextConfig } from "next";

// Espaces privés : jamais indexables, quel que soit l'environnement.
// L'en-tête double la balise <meta name="robots"> du layout racine — il couvre
// aussi les réponses non-HTML et les redirections, et il ne peut pas être
// annulé par le `generateMetadata` d'une page.
const PRIVATE_PATHS = [
  "/admin",
  "/back-office",
  "/account",
  "/store/:slug/order",
];

const NO_INDEX_HEADER = {
  key: "X-Robots-Tag",
  value: "noindex, nofollow",
};

const nextConfig: NextConfig = {
  async headers() {
    return PRIVATE_PATHS.flatMap((path) => [
      { source: path, headers: [NO_INDEX_HEADER] },
      { source: `${path}/:path*`, headers: [NO_INDEX_HEADER] },
    ]);
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "g10afdaataaj4tkl.public.blob.vercel-storage.com",
      },
      // ne pas exposer /_next/image vers localhost en prod (SSRF).
      ...(process.env.NODE_ENV === "development"
        ? [
            {
              protocol: "http" as const,
              hostname: "127.0.0.1",
              port: "54321",
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
    minimumCacheTTL: 2_592_000,
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [64, 128, 256, 384],
    formats: ["image/webp"],
  },
};

export default nextConfig;
