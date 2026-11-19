import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  // Keeps the dev-only indicator off the phone tab bar and the media credits at the bottom of the screen.
  devIndicators: { position: "top-left" },
};

export default nextConfig;
