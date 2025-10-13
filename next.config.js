/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // Proxy to Express server
      },
    ]
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production'
      ? 'https://your-domain.com'
      : 'http://localhost:3001',
  },
}

module.exports = nextConfig