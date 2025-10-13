/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 latest features
  experimental: {
    // Enable React 19 features
    reactCompiler: false, // Set to true if you want to use React Compiler (experimental)
  },

  // Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Enhanced image optimization for Next.js 15
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    // Next.js 15 image optimization improvements
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // API proxy configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // Proxy to Express server
      },
    ]
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production'
      ? 'https://your-domain.com'
      : 'http://localhost:3001',
  },

  // Performance optimizations for latest Next.js
  poweredByHeader: false,
  compress: true,

  // Enhanced logging and debugging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.next.json',
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Webpack optimizations for Next.js 15
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add any custom webpack configurations here
    return config
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig