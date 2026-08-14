import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/program/:path*",
        destination: "/learninglabs/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
