const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    relay: require("./relay.config"),
  },
  async rewrites() {
    // Only proxy requests to API host if defined. We don't want to do this in
    // prod because nginx takes care of it there
    const apiHost = process.env.BETA_SPRAY_API_HOST;
    return apiHost
      ? [
          // Proxy API requests
          {
            source: "/api/:path*",
            destination: `${apiHost}/api/:path*`, // Proxy to Backend
          },
        ]
      : [];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
