import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server-side packages that shouldn't be bundled
  serverExternalPackages: [
    'esbuild',
    'drizzle-kit',
    '@payloadcms/db-postgres',
    '@payloadcms/drizzle',
  ],

  // Turbopack configuration for Next.js 16
  turbopack: {
    rules: {
      '*.md': ['raw-loader'],
      // Ignore esbuild binaries and READMEs in node_modules
      '**/node_modules/@esbuild/**/*.md': ['raw-loader'],
      '**/node_modules/esbuild/**': ['raw-loader'],
    },
  },

  // Image configuration
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL].map((item) => {
        const url = new URL(item)
        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
      // Add Vercel deployment URLs
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
    ],
    localPatterns: [
      {
        pathname: '/api/media/**',
        search: '',
      },
    ],
    qualities: [100, 75],
  },

  // Experimental features (uncomment if needed in development)
  // experimental: {
  //   allowPrivateNetwork: process.env.NODE_ENV === 'development',
  // },

  // Webpack configuration (for when not using Turbopack)
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },

  reactStrictMode: true,
  async redirects() {
    const customRedirects = await redirects()
    return [
      ...customRedirects,
      {
        source: '/posts',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/posts/:slug',
        destination: '/blog/:slug',
        permanent: true, // 301 redirect
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
