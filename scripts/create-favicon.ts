import sharp from 'sharp';
import path from 'path';

async function createFavicon() {
  const size = 32;
  const backgroundColor = { r: 0, g: 0, b: 0, alpha: 1 };
  
  // Create a PNG first
  const pngBuffer = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: backgroundColor
    }
  })
  .png()
  .toBuffer();

  // Convert PNG to ICO using sharp
  await sharp(pngBuffer)
    .resize(size, size)
    .toFile(path.join(process.cwd(), 'public', 'favicon.ico'));
  
  console.log('Created temporary favicon.ico');
}

createFavicon().catch(console.error); 