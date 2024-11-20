/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  pageExtensions: ['tsx', 'ts'],
  pages: false,
  images: {
    domains: ['avatar.vercel.sh'],
  },
}

module.exports = nextConfig 