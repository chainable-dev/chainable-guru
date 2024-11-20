import { Reporter, TaskResult, Vitest, File, ErrorWithDiff } from 'vitest';
import chalk from 'chalk';
import { TEST_CATEGORIES, TestCategory } from './test-categories';

export default class ProgressReporter implements Reporter {
  private categories: Map<string, { total: number; passed: number }> = new Map();
  private total = 0;
  private passed = 0;
  private failed = 0;
  private errors: Array<{ category: TestCategory; file: string; test: string; error: Error }> = [];
  private startTime: number = Date.now();
  private isWatch: boolean = false;

  onInit(ctx: Vitest) {
    this.isWatch = ctx.config.watch || false;
    this.startTime = Date.now();
    this.passed = 0;
    this.failed = 0;
    this.errors = [];
    
    // Initialize categories
    Object.values(TEST_CATEGORIES).forEach(category => {
      this.categories.set(category, { total: 0, passed: 0 });
    });

    if (!this.isWatch) {
      console.log(chalk.cyan('\n🚀 Starting test suite...\n'));
    }
  }

  onCollected(files?: File[]) {
    if (files) {
      this.total = files.reduce((acc, file) => acc + file.tasks.length, 0);
      if (this.isWatch) {
        console.clear();
        console.log(chalk.cyan('\n👀 Watch Mode - Running tests...\n'));
      }
      console.log(chalk.cyan(`Found ${this.total} tests in ${files.length} files\n`));
    }
  }

  private getCategoryFromFilePath(filePath: string): TestCategory {
    if (filePath.includes('architecture')) return TEST_CATEGORIES.ARCHITECTURE;
    if (filePath.includes('components')) return TEST_CATEGORIES.COMPONENTS;
    if (filePath.includes('api')) return TEST_CATEGORIES.API;
    if (filePath.includes('hooks')) return TEST_CATEGORIES.HOOKS;
    if (filePath.includes('utils')) return TEST_CATEGORIES.UTILS;
    if (filePath.includes('layout')) return TEST_CATEGORIES.LAYOUTS;
    if (filePath.includes('routing')) return TEST_CATEGORIES.ROUTING;
    if (filePath.includes('data-fetching')) return TEST_CATEGORIES.DATA_FETCHING;
    if (filePath.includes('error-handling')) return TEST_CATEGORIES.ERROR_HANDLING;
    return TEST_CATEGORIES.UTILS;
  }

  onTestFailed(test: TaskResult) {
    this.failed++;
    const category = this.getCategoryFromFilePath(test.file?.name || '');
    this.errors.push({
      category,
      file: test.file?.name || 'unknown',
      test: test.name,
      error: test.error || new Error('Unknown error'),
    });
  }

  onTestPassed() {
    this.passed++;
  }

  onTestFinished(task: TaskResult) {
    const percentage = Math.round(((this.passed + this.failed) / this.total) * 100) || 0;
    const bar = '█'.repeat(percentage / 2) + '░'.repeat(50 - percentage / 2);
    const category = this.getCategoryFromFilePath(task.file?.name || '');
    const categoryStats = this.categories.get(category) || { total: 0, passed: 0 };
    
    categoryStats.total++;
    if (task.state === 'pass') {
      categoryStats.passed++;
    }
    
    this.categories.set(category, categoryStats);
    
    process.stdout.write(
      `\r${chalk.cyan('[Progress]')} [${bar}] ${percentage}% | ` +
      `${chalk.green(`${this.passed} passed`)} | ` +
      `${chalk.red(`${this.failed} failed`)} | ` +
      `${this.passed + this.failed}/${this.total} tests`
    );
  }

  onFinished() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log('\n\n' + chalk.cyan('📊 Test Results by Category:'));

    // Show results by category
    this.categories.forEach((stats, category) => {
      const passRate = (stats.passed / stats.total * 100) || 0;
      const color = passRate === 100 ? chalk.green : passRate >= 80 ? chalk.yellow : chalk.red;
      
      if (stats.total > 0) {
        console.log(
          color(`\n${category}:`),
          color(`${stats.passed}/${stats.total} (${passRate.toFixed(1)}%)`)
        );
      }
    });

    // Show error summary if there are failures
    if (this.errors.length > 0) {
      console.log(chalk.red('\n❌ Failed Tests:\n'));
      this.errors.forEach(({ category, file, test, error }, index) => {
        console.log(chalk.red(`${index + 1}) [${category}] ${file}`));
        console.log(chalk.red(`   Test: ${test}`));
        console.log(chalk.gray(`   Error: ${error.message}`));
        if (error.stack) {
          const relevantStack = error.stack.split('\n').slice(1, 3).join('\n');
          console.log(chalk.gray(`   Stack: ${relevantStack}\n`));
        }
      });
    }

    // Show final summary
    console.log(chalk.cyan('\n📈 Overall Summary:'));
    console.log(chalk.white(`▸ Duration: ${duration}s`));
    console.log(chalk.white(`▸ Total Tests: ${this.total}`));
    console.log(chalk.green(`▸ Passed: ${this.passed}`));
    console.log(chalk.red(`▸ Failed: ${this.failed}`));
    
    const coverage = ((this.passed / this.total) * 100).toFixed(1);
    const coverageColor = Number(coverage) >= 80 ? chalk.green : chalk.yellow;
    console.log(coverageColor(`▸ Coverage: ${coverage}%`));

    if (this.isWatch) {
      console.log(chalk.cyan('\nWatch Commands:'));
      console.log(chalk.white('Press "a" to run all tests'));
      console.log(chalk.white('Press "f" to run only failed tests'));
      console.log(chalk.white('Press "u" to update snapshots'));
      console.log(chalk.white('Press "q" to quit'));
    }

    console.log('\n');

    if (this.failed === 0) {
      console.log(chalk.green('✅ All tests passed successfully!\n'));
    } else {
      console.log(chalk.red(`❌ ${this.failed} test(s) failed.\n`));
      if (!this.isWatch) {
        process.exit(1);
      }
    }
  }
} 