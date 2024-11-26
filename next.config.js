/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "avatar.vercel.sh",
			},
			{
				protocol: "https",
				hostname: "chainable.guru",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
			},
			{
				protocol: "https",
				hostname: "img.clerk.com",
			},
		],
	},
	experimental: {
		ppr: true,
	},
};

module.exports = nextConfig;
