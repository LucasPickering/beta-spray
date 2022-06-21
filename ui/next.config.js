// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore 2322
    relay: require("./relay.config"),
  },
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
