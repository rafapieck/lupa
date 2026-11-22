import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Card fonts are read from disk by the image routes (lib/card-fonts.ts).
  outputFileTracingIncludes: {
    "/api/card": ["./assets/fonts/*.woff"],
    "/s/[verdict]/[patterns]/opengraph-image": ["./assets/fonts/*.woff"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
