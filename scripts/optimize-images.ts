import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const LOGOS_DIR = path.join(PUBLIC_DIR, 'logos');

interface ImageSizes {
  width: number;
  height?: number;
  suffix: string;
}

const FAVICON_SIZES: ImageSizes[] = [
  { width: 16, suffix: '16x16' },
  { width: 32, suffix: '32x32' },
  { width: 48, suffix: '48x48' },
  { width: 180, suffix: '180x180' }, // Apple touch icon
];

const LOGO_SIZES: ImageSizes[] = [
  { width: 64, suffix: 'sm' },
  { width: 128, suffix: 'md' },
  { width: 256, suffix: 'lg' },
];

async function optimizeImage(inputPath: string, outputPath: string, options: sharp.ResizeOptions = {}) {
  try {
    await sharp(inputPath)
      .resize(options)
      .webp({ quality: 80 }) // Use WebP for better compression
      .toFile(outputPath + '.webp');

    await sharp(inputPath)
      .resize(options)
      .png({ quality: 80 })
      .toFile(outputPath + '.png');

    console.log(`✓ Optimized: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`✗ Failed to optimize: ${path.basename(outputPath)}`, error);
  }
}

async function generateFavicons(inputSvg: string) {
  for (const size of FAVICON_SIZES) {
    const outputPath = path.join(PUBLIC_DIR, `favicon-${size.suffix}`);
    await optimizeImage(inputSvg, outputPath, {
      width: size.width,
      height: size.width,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    });
  }

  // Create ICO file containing multiple sizes
  const pngFiles = FAVICON_SIZES.map(size => 
    path.join(PUBLIC_DIR, `favicon-${size.suffix}.png`)
  );
  
  // Use sharp to create favicon.ico
  await sharp(pngFiles[0])
    .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));
}

async function optimizeLogos() {
  const files = fs.readdirSync(LOGOS_DIR);
  
  for (const file of files) {
    if (file.match(/\.(svg|png|jpg|jpeg)$/i)) {
      const inputPath = path.join(LOGOS_DIR, file);
      const filename = path.parse(file).name;

      for (const size of LOGO_SIZES) {
        const outputPath = path.join(LOGOS_DIR, `${filename}-${size.suffix}`);
        await optimizeImage(inputPath, outputPath, {
          width: size.width,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        });
      }
    }
  }
}

async function main() {
  // Ensure directories exist
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.mkdirSync(LOGOS_DIR, { recursive: true });

  // Generate favicons from logo
  const logoPath = path.join(LOGOS_DIR, 'elron2.svg');
  await generateFavicons(logoPath);

  // Optimize all logos
  await optimizeLogos();

  // Clean up temporary files
  FAVICON_SIZES.forEach(size => {
    const tempFile = path.join(PUBLIC_DIR, `favicon-${size.suffix}.png`);
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  });

  console.log('✓ Image optimization complete!');
}

main().catch(console.error); 