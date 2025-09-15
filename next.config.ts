// next.config.js
import path from 'path';

export default {
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname); // Set @ to root directory
    // Disable Node.js modules not needed in browser to avoid Edge Runtime conflicts
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  // Experimental flag to exclude Supabase from Edge Runtime
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js', '@supabase/ssr'],
  },
};

// Optional: Apply Node.js runtime to specific routes if needed
// Example for an API route or middleware (create a file like pages/api/example.ts)
// export const config = {
//   runtime: 'nodejs',
// };