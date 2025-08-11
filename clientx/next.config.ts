import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true, // optional
  images: {
    unoptimized: true, // needed if you use next/image
  },
};

export default nextConfig;
