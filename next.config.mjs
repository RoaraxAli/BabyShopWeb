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
    return {
      // beforeFiles: proxy documentation routes before Next.js checks its own pages
      beforeFiles: [
        {
          source: '/documentation',
          destination: 'http://localhost:3001/documentation',
        },
        {
          source: '/documentation/:path*',
          destination: 'http://localhost:3001/documentation/:path*',
        },
      ],
      afterFiles: [],
      // fallback: if the main app can't serve a /_next/ asset, forward to fumadocs
      // This catches CSS, JS chunks, fonts, and HMR requests from fumadocs pages
      fallback: [
        {
          source: '/_next/:path*',
          destination: 'http://localhost:3001/_next/:path*',
        },
        {
          source: '/__nextjs_original-stack-frames',
          destination: 'http://localhost:3001/__nextjs_original-stack-frames',
        },
      ],
    };
  },
};

export default nextConfig;
