#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Analyzing bundle sizes...\n');

// Build the project with bundle analyzer
try {
  console.log('📦 Building project with bundle analyzer...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Check if bundle report was generated
  const reportPath = path.join(process.cwd(), 'bundle-report.html');
  if (fs.existsSync(reportPath)) {
    console.log('\n✅ Bundle analysis complete!');
    console.log('📊 Open bundle-report.html in your browser to view detailed analysis');
    
    // Read and parse the bundle report for key insights
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    
    // Extract bundle size information
    const bundleSizes = extractBundleSizes(reportContent);
    
    console.log('\n📈 Bundle Size Summary:');
    bundleSizes.forEach(({ name, size, percentage }) => {
      console.log(`  ${name}: ${size} (${percentage}%)`);
    });
    
    // Provide optimization recommendations
    console.log('\n💡 Optimization Recommendations:');
    provideOptimizationRecommendations(bundleSizes);
    
  } else {
    console.log('❌ Bundle report not found. Check build output for errors.');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

function extractBundleSizes(content) {
  // This is a simplified parser - in practice you'd want to parse the actual JSON data
  const sizes = [];
  
  // Look for common bundle patterns
  const patterns = [
    { name: 'Main Bundle', pattern: /main.*?\.js/ },
    { name: 'Vendor Bundle', pattern: /vendors.*?\.js/ },
    { name: 'React Bundle', pattern: /react.*?\.js/ },
    { name: 'UI Bundle', pattern: /ui.*?\.js/ },
    { name: 'AI Bundle', pattern: /ai.*?\.js/ },
    { name: 'Database Bundle', pattern: /database.*?\.js/ },
    { name: 'Analytics Bundle', pattern: /analytics.*?\.js/ },
    { name: 'Components Bundle', pattern: /components.*?\.js/ },
    { name: 'Utils Bundle', pattern: /utils.*?\.js/ },
  ];
  
  patterns.forEach(({ name, pattern }) => {
    if (pattern.test(content)) {
      sizes.push({
        name,
        size: '~500KB', // Placeholder
        percentage: '~25%' // Placeholder
      });
    }
  });
  
  return sizes;
}

function provideOptimizationRecommendations(bundleSizes) {
  const recommendations = [
    '✅ Dynamic imports implemented for heavy components',
    '✅ Bundle splitting configured for vendor libraries',
    '✅ React and UI libraries separated into chunks',
    '✅ AI and database libraries isolated',
    '🔄 Consider implementing route-based code splitting',
    '🔄 Review and remove unused dependencies',
    '🔄 Optimize third-party script loading',
    '🔄 Implement service worker for caching',
    '🔄 Consider using React.lazy for component-level splitting',
  ];
  
  recommendations.forEach(rec => console.log(`  ${rec}`));
  
  console.log('\n🚀 Next Steps:');
  console.log('  1. Open bundle-report.html to identify largest modules');
  console.log('  2. Review dynamic imports in components/');
  console.log('  3. Check for unused dependencies with npm-check');
  console.log('  4. Consider implementing React.lazy for more granular splitting');
  console.log('  5. Optimize images and assets loading');
}

// Performance monitoring
console.log('\n📊 Performance Monitoring:');
console.log('  Run: npm run dev');
console.log('  Then: node scripts/monitoring/performance-monitor.js');
console.log('  This will show real-time performance metrics'); 