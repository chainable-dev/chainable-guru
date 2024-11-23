import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function generateIcons() {
  // Source image should be at least 512x512
  const sourceImage = path.join(process.cwd(), 'public', 'icon-source.png');
  const publicDir = path.join(process.cwd(), 'public');

  // Ensure source image exists
  try {
    await fs.access(sourceImage);
  } catch {
    console.error('Please provide icon-source.png in public directory');
    process.exit(1);
  }

  const sizes = {
    'favicon.ico': 32,
    'icon.png': 32,
    'apple-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
  };

  for (const [filename, size] of Object.entries(sizes)) {
    const outputPath = path.join(publicDir, filename);
    
    if (filename.endsWith('.ico')) {
      // For ICO files, create PNG first then save as ICO
      const pngBuffer = await sharp(sourceImage)
        .resize(size, size)
        .png()
        .toBuffer();

      await sharp(pngBuffer)
        .toFile(outputPath);
    } else {
      await sharp(sourceImage)
        .resize(size, size)
        .toFile(outputPath);
    }
    
    console.log(`Generated ${filename}`);
  }

  // Copy SVG icon if it exists
  const sourceSvg = path.join(process.cwd(), 'public', 'icon-source.svg');
  try {
    await fs.access(sourceSvg);
    await fs.copyFile(sourceSvg, path.join(publicDir, 'icon.svg'));
    console.log('Copied icon.svg');
  } catch {
    console.warn('No SVG source found, skipping');
  }
}

generateIcons().catch(console.error); 