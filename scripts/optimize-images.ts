import sharp from "sharp";
import fs from "fs";
import path from "path";

interface OptimizeOptions {
	skipMissing?: boolean;
	silent?: boolean;
}

export async function optimizeImages(options: OptimizeOptions = {}) {
	const { skipMissing = false, silent = false } = options;

	const sizes = {
		"favicon-16x16": 16,
		"favicon-32x32": 32,
		"favicon-48x48": 48,
		"favicon-180x180": 180,
	};

	try {
		const sourcePath = path.join(process.cwd(), "public/logos/elron2.svg");

		// Skip if source doesn't exist
		if (!fs.existsSync(sourcePath)) {
			if (!silent) {
				console.log("⚠️ Source file not found, skipping image optimization");
			}
			return;
		}

		for (const [name, size] of Object.entries(sizes)) {
			try {
				await sharp(sourcePath)
					.resize(size, size)
					.toFile(path.join(process.cwd(), `public/${name}.png`));
			} catch (error) {
				if (!skipMissing && !silent) {
					console.error(`✗ Failed to optimize: ${name}`, error);
				}
			}
		}
	} catch (error) {
		if (!silent) {
			console.error("✗ Image optimization failed:", error);
		}
	}
}

// Run if called directly
if (require.main === module) {
	optimizeImages();
}
