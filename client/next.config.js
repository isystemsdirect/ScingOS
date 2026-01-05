/** @type {import('next').NextConfig} */
const path = require('path');
const { execSync } = require('child_process');

function safeExec(cmd) {
  try {
    return execSync(cmd, {
      cwd: path.resolve(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

const BUILD_SHA =
  process.env.NEXT_PUBLIC_BUILD_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  safeExec('git rev-parse HEAD') ||
  'unknown';

const BUILD_BRANCH =
  process.env.NEXT_PUBLIC_BUILD_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  safeExec('git rev-parse --abbrev-ref HEAD') ||
  'unknown';

const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();

const nextConfig = {
  reactStrictMode: true,
  experimental: { externalDir: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@scing': path.resolve(__dirname, '../scing'),
      '@rtsf': path.resolve(__dirname, '../src'),
      '@scingular/sdk': path.resolve(__dirname, '../packages/scingular-sdk/src'),
      '@scingular/policy': path.resolve(__dirname, '../packages/scingular-policy/src'),
      '@scingular/devkit': path.resolve(__dirname, '../packages/scingular-devkit/src'),
      '@scingular/bfi-intent': path.resolve(__dirname, '../packages/bfi-intent/src'),
      '@scingular/bfi-policy': path.resolve(__dirname, '../packages/bfi-policy/src'),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime'),
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'ScingOS',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    NEXT_PUBLIC_BUILD_SHA: BUILD_SHA,
    NEXT_PUBLIC_BUILD_BRANCH: BUILD_BRANCH,
    NEXT_PUBLIC_BUILD_TIME: BUILD_TIME,
  },
};

module.exports = nextConfig;