/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      }
    ],
    domains: ['avatars.githubusercontent.com']
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              style-src 'self' 'unsafe-inline';
              img-src 'self' blob: data: https://*.public.blob.vercel-storage.com https://avatar.vercel.sh https://avatars.githubusercontent.com;
              font-src 'self';
              connect-src 'self' 
                https://*.supabase.co
                https://explorer-api.walletconnect.com
                https://verify.walletconnect.com
                https://verify.walletconnect.org
                https://pulse.walletconnect.org
                https://mainnet.base.org
                https://sepolia.base.org
                https://goerli.base.org
                https://*.base.org
                wss://*.supabase.co
                wss://*.walletconnect.org
                wss://*.walletconnect.com
                wss://*.base.org
                https://*.supabase.co/auth/v1/user;
              frame-src 'self' 
                https://verify.walletconnect.com 
                https://verify.walletconnect.org
                https://*.base.org;
              frame-ancestors 'self' 
                https://*.chainable.finance 
                https://chainable.finance;
              worker-src 'self' blob:;
            `.replace(/\s{2,}/g, ' ').trim()
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig 