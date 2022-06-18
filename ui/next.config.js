// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  async rewrites() {
    return [
      // Proxy API requests
      {
        source: "/api/:path*",
        destination: `${process.env.BETA_SPRAY_API_HOST}/api/:path*`, // Proxy to Backend
      },
    ];
  },
};

module.exports = nextConfig;
