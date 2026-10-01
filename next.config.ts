import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/program/:path*",
        destination: "/learninglabs/:path*",
        permanent: true,
      },
      {
        source: "/pre-teens",
        destination: "/",
        permanent: true,
      },
      {
        source: "/teens",
        destination: "/",
        permanent: true,
      },
      {
        source: "/campus",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
