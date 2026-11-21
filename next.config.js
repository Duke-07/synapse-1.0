/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Clean next config: internal Next.js Route Handlers serve /api/v1 out of the box
  // If an external backend URL is provided (e.g. Render/Railway), requests are proxied seamlessly.
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      // Allow internal Next.js Route Handlers in /src/app/api/v1 to handle all requests
      return [];
    }
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
