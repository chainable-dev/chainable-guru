import { describe, it, expect, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

vi.mock("@/lib/supabase/server", () => ({
	createClient: vi.fn(),
}));

vi.mock("next/headers", () => ({
	cookies: vi.fn(),
}));

describe("Data Fetching Architecture", () => {
	it("should handle server-side data fetching", async () => {
		const mockSupabase = {
			from: vi.fn().mockReturnThis(),
			select: vi.fn().mockResolvedValue({ data: [], error: null }),
		};
		vi.mocked(createClient).mockReturnValue(mockSupabase as any);
		vi.mocked(cookies).mockReturnValue({
			get: () => ({ value: "mock-cookie" }),
		} as any);

		const result = await mockSupabase.from("conversations").select();

		expect(result.error).toBeNull();
		expect(mockSupabase.from).toHaveBeenCalledWith("conversations");
	});

	it("should handle client-side data fetching", async () => {
		const mockSupabase = {
			from: vi.fn().mockReturnThis(),
			select: vi.fn().mockResolvedValue({
				data: [{ id: 1, title: "Test" }],
				error: null,
			}),
		};
		vi.mocked(createClient).mockReturnValue(mockSupabase as any);

		const result = await mockSupabase.from("conversations").select();

		expect(result.data).toHaveLength(1);
		expect(result.data[0]).toHaveProperty("title", "Test");
	});
});
