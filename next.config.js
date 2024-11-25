/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		// Remove serverActions as it's now enabled by default
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
			},
			{
				protocol: 'https',
				hostname: 'avatar.vercel.sh',
			},
		],
	},
}

module.exports = nextConfig
