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

		const mockCookieStore = {
			get: vi.fn().mockReturnValue({ value: "mock-cookie" }),
			set: vi.fn(),
		};

		vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
		vi.mocked(cookies).mockReturnValue(mockCookieStore as any);

		const supabase = await createClient();
		const result = await supabase.from("conversations").select();

		expect(result.error).toBeNull();
		expect(mockSupabase.from).toHaveBeenCalledWith("conversations");
		expect(mockCookieStore.get).toHaveBeenCalled();
	});
});
