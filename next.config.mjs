/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/documentation",
        destination: "http://localhost:3001/documentation",
      },
      {
        source: "/documentation/:path*",
        destination: "http://localhost:3001/documentation/:path*",
      },
    ];
  },
};

export default nextConfig;
