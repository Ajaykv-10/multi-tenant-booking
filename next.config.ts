import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  // Keep @react-pdf/renderer server-side — it uses Node-only APIs
  serverExternalPackages: ["@react-pdf/renderer", "canvas"],
};

export default nextConfig;
