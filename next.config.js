/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 features
  experimental: {
    appDir: true,
    // Enable React 19 features
    reactCompiler: false, // Set to true if you want to use React Compiler
  },

  // Image optimization
  images: {
    domains: ['localhost'],
    // Next.js 15 image optimization improvements
    formats: ['image/webp', 'image/avif'],
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

  // Performance optimizations for Next.js 15
  poweredByHeader: false,
  compress: true,

  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig