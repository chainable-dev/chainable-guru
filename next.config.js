/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'your-image-domain.com',
      'avatar.vercel.sh',
    ],
    formats: ['image/avif', 'image/webp'],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            icon: true,
          },
        },
      ],
    });

    return config;
  },
}

module.exports = nextConfig 