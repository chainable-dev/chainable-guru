/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatar.vercel.sh', 'chainable.guru'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'chainable.co',
      },
      {
        protocol: 'https',
        hostname: 'chainable.guru',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
      }
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack(config) {
    // SVG Configuration
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
  }
}

module.exports = nextConfig 