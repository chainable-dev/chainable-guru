import { render, screen } from "@testing-library/react";
import { WalletView } from "@/components/custom/wallet-view";
import { vi } from "vitest";

describe("WalletView", () => {
	const mockPortfolio = {
		total_usd: 1000,
		chain_list: [
			{
				id: "base",
				name: "Base",
				native_token_id: "eth",
				usd_value: 500,
				tokens: [
					{
						symbol: "ETH",
						amount: 0.5,
						price: 1000,
						usd_value: 500,
					},
				],
			},
		],
	};

	it("renders portfolio data correctly", () => {
		render(<WalletView portfolio={mockPortfolio} />);
		expect(screen.getByText("$1,000.00")).toBeInTheDocument();
		expect(screen.getByText("Base")).toBeInTheDocument();
		expect(screen.getByText("0.50 ETH")).toBeInTheDocument();
	});

	it("handles loading state", () => {
		render(<WalletView address="0x123" />);
		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("handles error state", () => {
		render(<WalletView error="Failed to load" />);
		expect(screen.getByText("Failed to load")).toBeInTheDocument();
	});
});
