/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: true,
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  images: {
    domains: ['localhost'],
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';
    const securityHeaders = [
      // Only set X-Frame-Options in production so local preview iframes work
      ...(!isDev
        ? [{ key: 'X-Frame-Options', value: 'DENY' }]
        : []),
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      // Allow embedding in dev preview panes
      ...(isDev
        ? [{ key: 'Content-Security-Policy', value: "frame-ancestors 'self' *" }]
        : []),
    ];

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;