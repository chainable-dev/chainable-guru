/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{
						key: 'Cross-Origin-Opener-Policy',
						value: 'same-origin-allow-popups'
					},
					{
						key: 'Cross-Origin-Embedder-Policy',
						value: 'credentialless'
					},
					{
						key: 'Cross-Origin-Resource-Policy',
						value: 'cross-origin'
					}
				],
			},
		]
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
		],
	},
	experimental: {
		optimizePackageImports: ['@rainbow-me/rainbowkit'],
	}
}

module.exports = nextConfig
