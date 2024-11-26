/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
		],
	},
	sassOptions: {
		includePaths: ['./styles'],
	},
}

module.exports = nextConfig
