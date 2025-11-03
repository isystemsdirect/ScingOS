// next.config.js - Complete Firebase-optimized configuration
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Enable webpack build worker for better performance
    webpackBuildWorker: true,
    // Server actions for drone control
    serverActions: true,
    // Optimize server components
    serverComponentsExternalPackages: [
      'firebase-admin',
      '@firebase/admin',
      'google-auth-library'
    ]
  },

  // Webpack configuration for Firebase optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Firebase Admin SDK optimizations for server-side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'firebase-admin': 'commonjs firebase-admin',
        'google-auth-library': 'commonjs google-auth-library',
        '@google-cloud/firestore': 'commonjs @google-cloud/firestore',
        '@google-cloud/storage': 'commonjs @google-cloud/storage',
      });
    }

    // Client-side Firebase optimizations
    if (!isServer) {
      // Exclude server-only modules from client bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        'firebase-admin': false,
        'google-auth-library': false,
      };

      // Split Firebase into separate chunks for better caching
      if (config.optimization.splitChunks) {
        config.optimization.splitChunks.cacheGroups = {
          ...config.optimization.splitChunks.cacheGroups,
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: 'firebase',
            chunks: 'all',
            priority: 10,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 5,
          },
        };
      }
    }

    // Handle async dependencies properly
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Fix for "await is not allowed in non-async function" error
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      path: false,
      os: false,
      stream: false,
      util: false,
      url: false,
      assert: false,
      querystring: false,
      http: false,
      https: false,
      zlib: false,
    };

    // Ignore dynamic requires that cause build issues
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(lokijs|react-native-sqlite-storage)$/,
      })
    );

    // Drone control specific optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      '@drone': path.resolve(__dirname, 'src/lib/drone'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@firebase': path.resolve(__dirname, 'src/lib/firebase'),
    };
    
    // utf-8-validate and bufferutil externals for ws package
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

    return config;
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/api/drone/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'https://scingula-ai.com' 
              : '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // Redirects for Firebase hosting compatibility
  async redirects() {
    return [
      {
        source: '/drone-control/:droneId',
        destination: '/drone/:droneId/control',
        permanent: true,
      },
    ];
  },

  // Rewrites for API routes
  async rewrites() {
    return [
      {
        source: '/api/firebase/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      }
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Output configuration for deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Disable source maps in production for security
  productionBrowserSourceMaps: false,
};

export default nextConfig;
