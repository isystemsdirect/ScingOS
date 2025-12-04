/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
    ],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'ScingOS',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  },
};

module.exports = nextConfig;