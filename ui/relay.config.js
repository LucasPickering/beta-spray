module.exports = {
  src: "./src",
  schema: "./schema.graphql",
  language: "typescript",
  excludes: ["/node_modules/", "/build/"],
  noFutureProofEnums: true,
  featureFlags: {
    enable_relay_resolver_transform: true,
  },
};
