import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');
const sourceDir = path.join(process.cwd(), 'public', 'logos');

// List of favicon files to copy/create
const faviconFiles = [
  { source: 'elron2.svg', dest: 'icon.svg' },
  { source: 'elron2.svg', dest: 'favicon.ico' },
  { source: 'elron2.svg', dest: 'apple-icon.png' },
];

async function setupFavicons() {
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Copy each favicon file
  for (const file of faviconFiles) {
    const sourcePath = path.join(sourceDir, file.source);
    const destPath = path.join(publicDir, file.dest);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✓ Created ${file.dest}`);
    } else {
      console.error(`✗ Source file not found: ${file.source}`);
    }
  }
}

setupFavicons().catch(console.error); 