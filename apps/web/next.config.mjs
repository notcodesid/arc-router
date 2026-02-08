/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@arc-router/shared"],
  webpack: (config) => {
    // MetaMask SDK includes a React Native storage dependency which isn't needed for web.
    // Without this alias, Next emits a noisy "Module not found" warning during builds.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
      // WalletConnect pulls `pino` for logging; `pino-pretty` is an optional dependency
      // used for Node CLI pretty printing and isn't needed in the browser bundle.
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
