/** @type {import('next').NextConfig} */
const getBackendDestination = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) {
    return 'http://localhost:8000/api/v1/:path*';
  }
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api/v1') ? `${clean}/:path*` : `${clean}/api/v1/:path*`;
};

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: getBackendDestination(),
      },
    ];
  },
};

module.exports = nextConfig;
