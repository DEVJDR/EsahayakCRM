module.exports = {
  output: 'standalone', // Optional: Ensures a standalone output for better control
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js', '@supabase/ssr'], // Exclude Supabase from Edge Runtime
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }; // Disable Node.js modules not needed in browser
    return config;
  },
};