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
}

module.exports = nextConfig
