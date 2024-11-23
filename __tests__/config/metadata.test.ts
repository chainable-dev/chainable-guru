import { describe, it, expect } from "vitest";
import { metadata } from "@/app/layout";

describe("App Metadata", () => {
	it("has required metadata fields", () => {
		expect(metadata).toHaveProperty("title");
		expect(metadata).toHaveProperty("description");
		expect(metadata.title).toBeTruthy();
		expect(metadata.description).toBeTruthy();
	});

	it("has proper viewport settings", () => {
		expect(metadata.viewport).toEqual({
			width: "device-width",
			initialScale: 1,
			maximumScale: 1,
		});
	});

	it("has required icons", () => {
		const icons = metadata.icons;
		expect(icons).toBeDefined();
		expect(Array.isArray(icons) ? icons : [icons]).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					rel: expect.any(String),
					url: expect.any(String),
				}),
			]),
		);
	});
});
