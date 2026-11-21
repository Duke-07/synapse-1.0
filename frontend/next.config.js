/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // NOTE: Do NOT set output:'standalone' — Vercel handles output format automatically.
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      // Local dev: proxy to backend running on localhost:8000
      return [
        {
          source: '/api/v1/:path*',
          destination: 'http://localhost:8000/api/v1/:path*',
        },
      ];
    }
    // Production: proxy to deployed backend URL
    const base = apiUrl.replace(/\/+$/, '');
    const dest = base.endsWith('/api/v1')
      ? `${base}/:path*`
      : `${base}/api/v1/:path*`;
    return [
      {
        source: '/api/v1/:path*',
        destination: dest,
      },
    ];
  },
};

module.exports = nextConfig;
