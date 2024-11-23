import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import chalk from 'chalk';

export async function createTextIcon() {
  const publicDir = path.join(process.cwd(), 'public');

  // Ensure public directory exists
  try {
    await fs.access(publicDir);
  } catch {
    await fs.mkdir(publicDir, { recursive: true });
  }

  // Create a more compact SVG with smaller text
  const svgBuffer = Buffer.from(`
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#000000"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="160"
        font-weight="bold"
        fill="#FFFFFF"
        text-anchor="middle"
        dominant-baseline="middle"
        letter-spacing="-0.05em"
      >
        use
      </text>
    </svg>
  `);

  const sizes = {
    'favicon.ico': 16, // Smaller favicon
    'icon.png': 32,
    'apple-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
  };

  try {
    // Save the original SVG
    await sharp(svgBuffer)
      .toFile(path.join(publicDir, 'icon.svg'));
    console.log(chalk.green('✓ Generated icon.svg'));

    // Generate all other sizes
    for (const [filename, size] of Object.entries(sizes)) {
      const outputPath = path.join(publicDir, filename);
      
      try {
        if (filename.endsWith('.ico')) {
          const pngBuffer = await sharp(svgBuffer)
            .resize(size, size, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 1 }
            })
            .png()
            .toBuffer();

          await sharp(pngBuffer)
            .toFile(outputPath);
        } else {
          await sharp(svgBuffer)
            .resize(size, size, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 1 }
            })
            .toFile(outputPath);
        }
        
        console.log(chalk.green(`✓ Generated ${filename}`));
      } catch (error) {
        console.error(chalk.red(`✗ Failed to generate ${filename}`), error);
      }
    }
  } catch (error) {
    console.error(chalk.red('Failed to generate icons:'), error);
    process.exit(1);
  }
}

if (require.main === module) {
  createTextIcon().catch(console.error);
} 