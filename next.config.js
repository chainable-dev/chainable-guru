/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  pageExtensions: ['tsx', 'ts'],
  pages: false,
}

module.exports = nextConfig 