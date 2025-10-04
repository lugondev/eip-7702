/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  typescript: {
    // Only in development - remove for production
    ignoreBuildErrors: false,
  },
  eslint: {
    // Only in development - remove for production  
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };
    
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Ignore specific problematic modules
    config.ignoreWarnings = [
      /Module not found: Can't resolve '@react-native-async-storage\/async-storage'/,
      /Module not found: Can't resolve 'pino-pretty'/,
    ];
    
    return config;
  },
}

module.exports = nextConfig