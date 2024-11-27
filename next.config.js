/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	compiler: {
		styledComponents: true
	},
	images: {
		domains: [
			"avatar.vercel.sh",
			"chainable.guru",
			"avatars.githubusercontent.com",
			"img.clerk.com",
		],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**.public.blob.vercel-storage.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "**.vercel-storage.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "avatar.vercel.sh",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "img.clerk.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "**.vercel.app",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "**.opensea.io",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "**.nftstorage.link",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "ipfs.io",
				pathname: "/**",
			},
		],
		dangerouslyAllowSVG: true,
		contentDispositionType: "attachment",
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256],
		formats: ["image/webp", "image/avif"],
		minimumCacheTTL: 60 * 60 * 24 * 30,
		loader: "default",
		loaderFile: undefined,
		path: "/_next/image",
		disableStaticImages: false,
			unoptimized: process.env.NODE_ENV === "production",
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	experimental: {
		serverActions: {
			allowedOrigins: ["localhost:3000", "chainable.guru"],
			bodySizeLimit: "2mb",
		},
	},
	webpack(config) {
		config.module.rules.push({
			test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
			type: 'asset',
			generator: {
				filename: 'static/media/[name].[hash][ext]'
			}
		});

		return config;
	},
	rewrites() {
		return [
			{
				source: "/favicon.ico",
				destination: "/public/favicon.ico",
			},
			{
				source: "/logos/:path*",
				destination: "/public/logos/:path*",
			},
			{
				source: "/api/search/:path*",
				destination: "https://api.duckduckgo.com/:path*",
			},
			{
				source: "/api/opensearch/:path*",
				destination: "https://api.bing.microsoft.com/:path*",
			},
		];
	},
	headers() {
		return [
			{
				source: "/favicon.ico",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				source: "/icon.svg",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				source: "/api/search/:path*",
				headers: [
					{
						key: "Access-Control-Allow-Origin",
						value: "*",
					},
				],
			},
			{
				source: "/(.*).(jpg|jpeg|png|webp|avif|ico|svg)",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},
}

module.exports = nextConfig;
