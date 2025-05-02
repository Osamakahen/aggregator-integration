/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*'
      }
    ];
  },
  typescript: {
    ignoreBuildErrors: false
  }
};

module.exports = nextConfig; 