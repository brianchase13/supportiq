/**
 * Expert-Recommended Performance Optimizations
 * Based on best practices from Marc Lou, Vercel, and Next.js experts
 */

// 1. Next.js Performance Patterns
export const NEXTJS_OPTIMIZATIONS = {
  // Image optimization (Expert standard)
  images: {
    formats: ['webp', 'avif'], // Modern formats first
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    priority: 'above-the-fold only', // Critical images only
    placeholder: 'blur', // Always use blur placeholder
    quality: 75 // Sweet spot for size/quality
  },
  
  // Font optimization
  fonts: {
    strategy: 'swap', // Prevent layout shift
    preload: ['primary-font'], // Preload critical fonts only
    subset: 'latin', // Only needed character sets
    display: 'swap' // Fallback during load
  },
  
  // Bundle optimization
  bundles: {
    splitting: 'automatic', // Let Next.js handle it
    treeshaking: true, // Remove unused code
    minification: true, // Production optimization
    compression: 'gzip' // Server compression
  }
};

// 2. Database Performance (Expert patterns)
export const DATABASE_OPTIMIZATIONS = {
  // Supabase query optimization
  queries: {
    select: 'only-needed-fields', // Never SELECT *
    indexes: 'query-based', // Index what you query
    joins: 'minimize', // Keep joins simple
    pagination: 'cursor-based' // Better than OFFSET
  },
  
  // Connection management
  connections: {
    pooling: true, // Use connection pooling
    timeout: 5000, // 5 second timeout
    retries: 3, // Retry failed queries
    cache: 'aggressive' // Cache everything possible
  },
  
  // Query patterns
  patterns: {
    batch: 'Related queries together',
    lazy: 'Load data when needed',
    prefetch: 'Predictable next queries',
    memoize: 'Identical query results'
  }
};

// 3. API Route Performance
export const API_OPTIMIZATIONS = {
  // Response optimization
  responses: {
    compression: 'gzip',
    caching: 'aggressive',
    etags: true,
    streaming: 'large-responses'
  },
  
  // Request handling
  requests: {
    validation: 'early-exit', // Validate before processing
    authentication: 'cached', // Cache auth results
    rateLimit: 'per-endpoint', // Specific limits
    timeout: 10000 // 10 second max
  },
  
  // Error handling
  errors: {
    graceful: true, // Never crash
    logging: 'detailed', // Log for debugging
    retry: 'idempotent-only', // Safe to retry
    fallback: 'cached-data' // Serve stale if needed
  }
};

// 4. Client-Side Performance
export const CLIENT_OPTIMIZATIONS = {
  // React performance
  react: {
    memoization: 'expensive-computations',
    virtualization: 'large-lists',
    lazy: 'non-critical-components',
    suspense: 'async-boundaries'
  },
  
  // State management
  state: {
    local: 'component-specific',
    global: 'shared-data-only',
    persistence: 'essential-only',
    normalization: 'nested-data'
  },
  
  // Asset optimization
  assets: {
    bundling: 'route-based',
    splitting: 'vendor-app',
    preloading: 'next-route',
    prefetching: 'likely-navigation'
  }
};

// 5. Caching Strategy (Expert-level)
export const CACHING_STRATEGY = {
  // Browser caching
  browser: {
    static: '1 year', // CSS, JS, images
    api: '5 minutes', // API responses
    html: 'no-cache', // Always fresh HTML
    fonts: '1 year' // Fonts rarely change
  },
  
  // CDN caching
  cdn: {
    assets: 'permanent', // Versioned assets
    api: 'varies', // Based on data freshness
    images: '1 month', // Optimized images
    pages: '1 hour' // Static pages
  },
  
  // In-memory caching
  memory: {
    queries: '15 minutes', // Database results
    computations: '1 hour', // Expensive calculations
    auth: '5 minutes', // User sessions
    config: '1 day' // App configuration
  }
};

// 6. Monitoring & Optimization
export const PERFORMANCE_MONITORING = {
  // Web Vitals tracking
  vitals: {
    lcp: '< 2.5s', // Largest Contentful Paint
    fid: '< 100ms', // First Input Delay
    cls: '< 0.1', // Cumulative Layout Shift
    fcp: '< 1.8s', // First Contentful Paint
    ttfb: '< 600ms' // Time to First Byte
  },
  
  // Custom metrics
  custom: {
    timeToInteractive: '< 3s',
    timeToValue: '< 5s', // Gary Tan standard
    apiResponseTime: '< 200ms',
    errorRate: '< 0.1%'
  },
  
  // Performance budget
  budget: {
    jsBundle: '300kb', // JavaScript bundle size
    cssBundle: '50kb', // CSS bundle size
    images: '2mb', // Total image size
    fonts: '100kb', // Font files
    totalPage: '3mb' // Total page weight
  }
};

// 7. Expert Loading Patterns
export const LOADING_PATTERNS = {
  // Progressive loading
  progressive: {
    critical: 'Immediate load',
    important: 'After critical',
    optional: 'On interaction',
    background: 'When idle'
  },
  
  // Skeleton screens
  skeletons: {
    cards: 'Content placeholders',
    lists: 'Repeating patterns',
    text: 'Line placeholders',
    images: 'Blur placeholders'
  },
  
  // Error boundaries
  boundaries: {
    component: 'Isolated failures',
    page: 'Route-level recovery',
    global: 'App-wide fallback',
    async: 'Promise rejections'
  }
};

// 8. Expert Optimization Checklist
export const OPTIMIZATION_CHECKLIST = {
  // Pre-launch checklist
  preLaunch: [
    'Bundle analyzer run',
    'Lighthouse audit passed',
    'Web Vitals optimized',
    'Error boundaries tested',
    'Loading states implemented',
    'Caching strategy verified',
    'Database queries optimized',
    'API endpoints profiled'
  ],
  
  // Ongoing monitoring
  ongoing: [
    'Weekly performance review',
    'Monthly bundle analysis',
    'Quarterly UX audit',
    'Real user monitoring',
    'Performance regression alerts',
    'Core Web Vitals tracking'
  ]
};

// 9. Tool Configuration
export const TOOLS_CONFIG = {
  // Next.js config optimization
  nextConfig: {
    swcMinify: true, // Faster minification
    experimental: {
      optimizeCss: true, // CSS optimization
      esmExternals: true, // ES modules
      serverActions: true // Server actions
    },
    images: {
      formats: ['image/webp', 'image/avif'],
      minimumCacheTTL: 60 * 60 * 24 * 365 // 1 year
    }
  },
  
  // Webpack optimization
  webpack: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};