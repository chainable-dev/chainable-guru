/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	experimental: {
		serverActions: {
			allowedOrigins: ['localhost:3000']
		}
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
		],
	},
	webpack: (config) => {
		config.resolve.fallback = {
			...config.resolve.fallback,
			encoding: false,
		};
		return config;
	},
	distDir: '.next',
	poweredByHeader: false,
	typescript: {
		ignoreBuildErrors: process.env.NODE_ENV === 'development',
	},
	eslint: {
		ignoreDuringBuilds: process.env.NODE_ENV === 'development',
	},
};

module.exports = nextConfig;
