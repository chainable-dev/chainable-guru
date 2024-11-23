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
  experimental: {
    optimizeCss: true
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  }
}

module.exports = nextConfig 