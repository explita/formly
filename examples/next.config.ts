import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_IS_EXAMPLES: "true",
  },
};

export default nextConfig;
