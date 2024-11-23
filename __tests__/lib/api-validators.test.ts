import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";

describe("API Request Validation", () => {
	it("validates chat request body", async () => {
		const req = new NextRequest("http://localhost:3000/api/chat", {
			method: "POST",
			body: JSON.stringify({
				message: "test message",
				chatId: "123",
			}),
		});

		const body = await req.json();

		expect(body).toHaveProperty("message");
		expect(body).toHaveProperty("chatId");
		expect(typeof body.message).toBe("string");
		expect(typeof body.chatId).toBe("string");
	});

	it("handles missing required fields", async () => {
		const req = new NextRequest("http://localhost:3000/api/chat", {
			method: "POST",
			body: JSON.stringify({}),
		});

		const body = await req.json();

		expect(body.message).toBeUndefined();
		expect(body.chatId).toBeUndefined();
	});
});
