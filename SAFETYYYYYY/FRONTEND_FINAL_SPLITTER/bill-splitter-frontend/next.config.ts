// import type { NextConfig } from 'next'

// const nextConfig: NextConfig = {
//   // Images from local backend
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//         port: '8000',
//         pathname: '/media/**',
//       },
//     ],
//   },

//   // Proxy API requests to backend
//   async rewrites() {
//     return [
//       {
//         source: '/api/:path*',
//         destination: 'http://localhost:8000/api/:path*',
//       },
//     ]
//   },

//   // Use faster source maps in development for debugging
//   webpack: (config, { dev, isServer }) => {
//     if (dev && !isServer) {
//       config.devtool = 'eval-source-map'
//     }
//     return config
//   },

//   // Disable production source maps to avoid errors
//   productionBrowserSourceMaps: false,
// }

// export default nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {}, // as you wrote
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ];
  },

  images: {
    domains: ['localhost', '127.0.0.1'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
