const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const {
  RelayCompilerPlugin,
} = require("@ch1ffa/relay-compiler-webpack-plugin");

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: "./src/index.tsx",
  target: "web",
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/",
    filename: "[name].[contenthash].bundle.js",
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.m?js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
      favicon: "public/favicon.ico",
    }),
    new RelayCompilerPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.WEBPACK_BUNDLE_ANALYZER_MODE || "disabled",
    }),
  ],

  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    extensions: [".tsx", ".ts", ".js"],
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        // This will effectively double the number of chunks, since each src
        // chunk will now have an associated one for vendors. The advantage is
        // that the vendor chunk will change much less often, so caching is
        // better.
        vendors: {
          test: /[/]node_modules[/]/,
          priority: -20,
          name: "vendors",
          chunks: "all",
          filename: "[name]-[id].[contenthash].bundle.js",
        },
        // This chonker gets his own little house
        vendorsRelay: {
          test: /[/]node_modules[/](react-relay|relay-runtime)[/]/,
          priority: -10,
          name: "vendorsRelay",
          chunks: "all",
          filename: "[name]-[id].[contenthash].bundle.js",
        },
      },
    },
  },

  watchOptions: {
    ignored: /node_modules/,
  },
  devServer: {
    host: process.env.WEBPACK_HOST,
    port: 3000,
    https: false,
    static: {
      directory: path.join(__dirname, "public"),
      watch: true,
    },
    historyApiFallback: true,
    hot: true,
    proxy: {
      "/api": process.env.BETA_SPRAY_API_HOST,
    },
  },
};
