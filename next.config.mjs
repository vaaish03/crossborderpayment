/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    // Exclude native Node addons from client bundle
    if (!isServer) {
      config.externals = [
        ...(config.externals || []),
        "sodium-native",
        "require-addon",
      ];
    }
    return config;
  },
};

export default nextConfig;
