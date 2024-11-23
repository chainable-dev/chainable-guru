import "./app/basic.test";
import "./components/basic.test";

import { describe, it, beforeAll } from "vitest";
import chalk from "chalk";

describe("Test Suite Organization", () => {
	beforeAll(() => {
		console.log(chalk.blue("\n📁 Test Categories:"));
		console.log(chalk.gray("├── Basic Tests"));
		console.log(chalk.gray("└── Component Tests\n"));
	});

	it("should run all test suites", () => {
		expect(true).toBe(true);
	});
});
