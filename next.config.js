/** @type {import('next').NextConfig} */
const nextConfig = {
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
			// Add blockchain-specific patterns
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
		// Configure local image handling
		dangerouslyAllowSVG: true,
		contentDispositionType: "attachment",
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		// Optimize images
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256],
		formats: ["image/webp", "image/avif"],
		minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
		// Allow local logos
		loader: "default",
		loaderFile: undefined,
		path: "/_next/image",
		disableStaticImages: false,
		unoptimized: process.env.NODE_ENV === "production",
	},
	// Other config
	typescript: {
		ignoreBuildErrors: true,
	},
	experimental: {
		serverActions: {
			allowedOrigins: ["localhost:3000", "chainable.guru"],
			bodySizeLimit: "2mb",
		},
	},
	// Add webpack configuration for handling local images
	webpack(config) {
		config.module.rules.push({
			test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
			issuer: /\.[jt]sx?$/,
			use: [
				{
					loader: "url-loader",
					options: {
						limit: 10000,
						name: "static/media/[name].[hash:8].[ext]",
						publicPath: "/_next",
					},
				},
			],
		});

		return config;
	},
	// Add public directory handling
	async rewrites() {
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
	// Add headers for cache control
	async headers() {
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
	// Add webpack configuration for static files
	webpack(config) {
		config.module.rules.push({
			test: /\.(ico|png|jpe?g|gif|svg|webp|avif)$/i,
			issuer: /\.[jt]sx?$/,
			use: [
				{
					loader: "url-loader",
					options: {
						limit: 10000,
						name: "static/media/[name].[hash:8].[ext]",
						publicPath: "/_next",
						fallback: "file-loader",
					},
				},
			],
		});

		return config;
	},
};

module.exports = nextConfig;
