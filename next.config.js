const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: true, // Dev modda devre dışı - sürekli yenileme sorunu
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['*.trycloudflare.com'],
  env: {
    NODE_ENV: 'production',
    DEMO_MODE: 'true',
  },
  // Webpack configuration
  webpack: (config) => {
    // Disable fs module on client side (required for Vercel)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

  
    return config;
  },
};

module.exports = withPWA(nextConfig); 