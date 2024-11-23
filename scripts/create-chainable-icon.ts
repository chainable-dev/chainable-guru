import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

async function createChainableIcon() {
	const publicDir = path.join(process.cwd(), "public", "icons");

	// Ensure icons directory exists
	await fs.mkdir(publicDir, { recursive: true });

	// Create SVG with chainable text
	const svgBuffer = Buffer.from(`
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#grad)"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="72"
        font-weight="bold"
        fill="#FFFFFF"
        text-anchor="middle"
        dominant-baseline="middle"
        letter-spacing="-0.02em"
      >
        chainable
      </text>
    </svg>
  `);

	// Save SVG
	await fs.writeFile(path.join(publicDir, "chainable.svg"), svgBuffer);

	// Generate PNG versions
	const sizes = {
		"chainable-16.png": 16,
		"chainable-32.png": 32,
		"chainable-180.png": 180,
		"favicon.ico": 32,
	};

	for (const [filename, size] of Object.entries(sizes)) {
		const outputPath = path.join(publicDir, filename);

		if (filename.endsWith(".ico")) {
			const pngBuffer = await sharp(svgBuffer)
				.resize(size, size, {
					fit: "contain",
					background: { r: 59, g: 130, b: 246, alpha: 1 },
				})
				.png()
				.toBuffer();

			await sharp(pngBuffer).toFile(outputPath);
		} else {
			await sharp(svgBuffer)
				.resize(size, size, {
					fit: "contain",
					background: { r: 59, g: 130, b: 246, alpha: 1 },
				})
				.toFile(outputPath);
		}
	}

	console.log("Generated chainable icons");
}

createChainableIcon().catch(console.error);
