import { describe, expect, it } from "vitest";
import { Metadata } from "next";

const metadata: Metadata = {
	title: "Elron - AI web3 chatbot",
	description: "An AI-powered chat bot built with Next.js and OpenAI",
	viewport: {
		width: "device-width",
		initialScale: 1,
	},
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/icon.svg", sizes: "any", type: "image/svg+xml" },
		],
		apple: [
			{ url: "/apple-icon.png", sizes: "180x180" },
		],
		shortcut: "/favicon.ico",
	},
};

describe("App Metadata", () => {
	it("has required metadata", () => {
		expect(metadata.title).toBeDefined();
		expect(metadata.description).toBeDefined();
	});

	it("has proper viewport settings", () => {
		expect(metadata.viewport).toEqual({
			width: "device-width",
			initialScale: 1,
		});
	});

	it("has required icons", () => {
		const icons = metadata.icons;
		expect(icons).toBeDefined();
		expect(icons).toEqual({
			icon: expect.arrayContaining([
				expect.objectContaining({
					url: expect.any(String),
					sizes: expect.any(String),
				}),
			]),
			apple: expect.arrayContaining([
				expect.objectContaining({
					url: expect.any(String),
					sizes: expect.any(String),
				}),
			]),
			shortcut: expect.any(String),
		});
	});
});
