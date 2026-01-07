import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
   async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "rategate.vercel.app",
          },
        ],
        destination: "https://reviews.rategate.cc/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
