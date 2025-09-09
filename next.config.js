/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 14
  env: {
    // Make sure PORT is available in the runtime
    PORT: process.env.PORT,
  },
  // Configure server options
  serverRuntimeConfig: {
    port: process.env.PORT || 3005,
  },
  publicRuntimeConfig: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005',
  },
  // CORS headers configuration
  async headers() {
    const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
    
    return [
      {
        // Apply CORS headers to all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
          // Note: Access-Control-Allow-Origin is handled dynamically in middleware
          // to support multiple origins based on the request origin
        ],
      },
    ];
  },
}

module.exports = nextConfig
