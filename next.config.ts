import type { NextConfig } from "next";

const isProdBuild = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  ...(isProdBuild ? { output: "export" as const } : {}),
};

export default nextConfig;
