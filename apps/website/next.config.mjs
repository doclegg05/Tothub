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