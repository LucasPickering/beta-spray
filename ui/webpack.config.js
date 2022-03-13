const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: "./src/index.tsx",
  target: "web",
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/",
    filename: "[name].bundle.js",
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.js$/,
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
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -20,
          name: "vendors",
          chunks: "all",
          filename: "[name].app.bundle.js",
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
