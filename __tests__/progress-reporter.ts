import { Reporter, TaskResult, Vitest, File, ErrorWithDiff } from "vitest";
import chalk from "chalk";

export default class ProgressReporter implements Reporter {
	private total = 0;
	private passed = 0;
	private failed = 0;
	private skipped = 0;
	private errors: Array<{ file: string; test: string; error: Error }> = [];
	private startTime: number = Date.now();
	private isWatch: boolean = false;
	private testResults: Map<
		string,
		{ passed: number; failed: number; total: number }
	> = new Map();

	onInit(ctx: Vitest) {
		this.isWatch = ctx.config.watch || false;
		this.startTime = Date.now();
		this.passed = 0;
		this.failed = 0;
		this.skipped = 0;
		this.errors = [];
		this.testResults.clear();

		if (!this.isWatch) {
			console.log(chalk.cyan("\n🚀 Starting test suite...\n"));
		}
	}

	onCollected(files?: File[]) {
		if (files) {
			this.total = files.reduce((acc, file) => acc + file.tasks.length, 0);
			if (this.isWatch) {
				console.clear();
				console.log(chalk.cyan("\n👀 Watch Mode - Running tests...\n"));
			}
			console.log(
				chalk.cyan(`Found ${this.total} tests in ${files.length} files\n`),
			);
		}
	}

	onTestFailed(test: TaskResult) {
		this.failed++;
		const fileResults = this.getFileResults(test.file?.name || "unknown");
		fileResults.failed++;

		this.errors.push({
			file: test.file?.name || "unknown",
			test: test.name || "unknown",
			error:
				test.errors?.[0] instanceof Error
					? test.errors[0]
					: new Error("Unknown error"),
		});
	}

	onTestPassed(test: TaskResult) {
		this.passed++;
		const fileResults = this.getFileResults(test.file?.name || "unknown");
		fileResults.passed++;
	}

	onTestSkipped() {
		this.skipped++;
	}

	private getFileResults(fileName: string) {
		if (!this.testResults.has(fileName)) {
			this.testResults.set(fileName, { passed: 0, failed: 0, total: 0 });
		}
		return this.testResults.get(fileName)!;
	}

	onTestFinished(task: TaskResult) {
		const completed = this.passed + this.failed + this.skipped;
		const percentage = Math.round((completed / this.total) * 100) || 0;
		const bar = "█".repeat(percentage / 2) + "░".repeat(50 - percentage / 2);

		process.stdout.write(
			`\r${chalk.cyan("[Progress]")} [${bar}] ${percentage}% | ` +
				`${chalk.green(`${this.passed} passed`)} | ` +
				`${chalk.red(`${this.failed} failed`)} | ` +
				`${this.skipped > 0 ? chalk.yellow(`${this.skipped} skipped`) + " | " : ""}` +
				`${completed}/${this.total} tests`,
		);
	}

	onFinished() {
		const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
		console.log("\n\n" + chalk.cyan("📊 Test Results by File:"));

		// Show results by file
		this.testResults.forEach((results, file) => {
			const passRate =
				(results.passed / (results.passed + results.failed)) * 100 || 0;
			const color =
				passRate === 100
					? chalk.green
					: passRate >= 80
						? chalk.yellow
						: chalk.red;
			const shortFile = file.split("/").slice(-2).join("/");

			console.log(
				color(`\n${shortFile}:`),
				color(
					`${results.passed}/${results.passed + results.failed} (${passRate.toFixed(1)}%)`,
				),
			);
		});

		// Show error summary if there are failures
		if (this.errors.length > 0) {
			console.log(chalk.red("\n❌ Failed Tests:\n"));
			this.errors.forEach(({ file, test, error }, index) => {
				const shortFile = file.split("/").slice(-2).join("/");
				console.log(chalk.red(`${index + 1}) ${shortFile} > ${test}`));
				console.log(chalk.gray(`   Error: ${error.message}`));
				if (error.stack) {
					const relevantStack = error.stack.split("\n").slice(1, 3).join("\n");
					console.log(chalk.gray(`   Stack: ${relevantStack}\n`));
				}
			});
		}

		// Show final summary
		console.log(chalk.cyan("\n📈 Overall Summary:"));
		console.log(chalk.white(`▸ Duration: ${duration}s`));
		console.log(chalk.white(`▸ Total Tests: ${this.total}`));
		console.log(chalk.green(`▸ Passed: ${this.passed}`));
		if (this.failed > 0) {
			console.log(chalk.red(`▸ Failed: ${this.failed}`));
		} else {
			console.log(chalk.green("▸ Failed: 0"));
		}
		if (this.skipped > 0) {
			console.log(chalk.yellow(`▸ Skipped: ${this.skipped}`));
		}

		const coverage = ((this.passed / this.total) * 100).toFixed(1);
		const coverageColor = Number(coverage) >= 80 ? chalk.green : chalk.yellow;
		console.log(coverageColor(`▸ Coverage: ${coverage}%`));

		if (this.isWatch) {
			console.log(chalk.cyan("\nWatch Commands:"));
			console.log(chalk.white('Press "a" to run all tests'));
			console.log(chalk.white('Press "f" to run only failed tests'));
			console.log(chalk.white('Press "u" to update snapshots'));
			console.log(chalk.white('Press "q" to quit'));
		}

		console.log("\n");

		if (this.failed === 0) {
			console.log(chalk.green("✅ All tests passed successfully!\n"));
		} else {
			console.log(chalk.red(`❌ ${this.failed} test(s) failed.\n`));
			if (!this.isWatch) {
				process.exit(1);
			}
		}
	}
}
