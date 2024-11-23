import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

async function verifyIcons() {
  const requiredFiles = [
    'favicon.ico',
    'icon.svg',
    'icon.png',
    'apple-icon.png',
    'android-chrome-192x192.png',
    'android-chrome-512x512.png'
  ];

  const publicDir = path.join(process.cwd(), 'public');
  const missingFiles = [];

  for (const file of requiredFiles) {
    try {
      await fs.access(path.join(publicDir, file));
      console.log(chalk.green(`✓ ${file} exists`));
    } catch {
      missingFiles.push(file);
      console.log(chalk.red(`✗ ${file} missing`));
    }
  }

  if (missingFiles.length > 0) {
    console.log(chalk.yellow('\nMissing files. Running icon generation...'));
    const { createTextIcon } = await import('./create-text-icon');
    await createTextIcon();
  }
}

verifyIcons().catch(console.error); 