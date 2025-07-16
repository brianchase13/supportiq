import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Enable Turbopack for faster builds
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Webpack configuration for code splitting
  webpack: (config, { dev, isServer }) => {
    // Enable bundle analyzer in production
    if (!dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-report.html',
        })
      );
    }

    // Optimize bundle splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // React and related libraries
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router|@types\/react)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
          // UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|@heroicons|lucide-react)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
          },
          // AI/ML libraries
          ai: {
            test: /[\\/]node_modules[\\/](openai|@anthropic-ai|langchain)[\\/]/,
            name: 'ai',
            chunks: 'all',
            priority: 15,
          },
          // Database libraries
          database: {
            test: /[\\/]node_modules[\\/](@supabase|postgres|pg)[\\/]/,
            name: 'database',
            chunks: 'all',
            priority: 15,
          },
          // Analytics libraries
          analytics: {
            test: /[\\/]node_modules[\\/](@sentry|@vercel|analytics)[\\/]/,
            name: 'analytics',
            chunks: 'all',
            priority: 15,
          },
          // Common components
          components: {
            test: /[\\/]components[\\/]/,
            name: 'components',
            chunks: 'all',
            priority: 5,
            minChunks: 2,
          },
          // Utils and libs
          utils: {
            test: /[\\/]lib[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 5,
            minChunks: 2,
          },
        },
      },
    };

    // Optimize module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './'),
    };

    return config;
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Compression
  compress: true,

  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig; 