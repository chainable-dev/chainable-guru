import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Remove ignoreBuildErrors for production
	typescript: {
		ignoreBuildErrors: process.env.NODE_ENV === "development",
	},
	
	// Simplify image configuration
	images: {
		remotePatterns: [
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
		],
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		// Optimize images
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256],
		formats: ["image/webp", "image/avif"],
		minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
	},
	
	// Enable experimental features properly
	experimental: {
		serverActions: {
			allowedOrigins: ["localhost:3000", "localhost:3001", "localhost:3002", "chainable.guru"],
			bodySizeLimit: "2mb",
		},
	},
	
	// Add security headers
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Referrer-Policy",
						value: "origin-when-cross-origin",
					},
				],
			},
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
	
	// Add rewrites for API routes
	async rewrites() {
		return [
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
};

export default nextConfig;
