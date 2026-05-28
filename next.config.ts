import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
    minimumCacheTTL: 2_592_000,
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [64, 128, 256, 384],
    formats: ["image/webp"],
  },
};

export default nextConfig;
