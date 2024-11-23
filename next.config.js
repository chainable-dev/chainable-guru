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
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  experimental: {
    optimizeCss: true
  }
}

module.exports = nextConfig 