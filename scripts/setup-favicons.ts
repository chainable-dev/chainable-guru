import { optimizeImages } from './optimize-images'
import fs from 'fs'
import path from 'path'

const SOURCE_LOGO = path.join(process.cwd(), 'public/logos/elron2.svg')
const FALLBACK_LOGO = path.join(process.cwd(), 'public/logos/default-logo.svg')

async function setupFavicons() {
  try {
    // Check if source logo exists, if not use fallback or skip
    const logoPath = fs.existsSync(SOURCE_LOGO) ? SOURCE_LOGO : 
                    fs.existsSync(FALLBACK_LOGO) ? FALLBACK_LOGO : null

    if (!logoPath) {
      console.log('⚠️ No logo files found, skipping favicon generation')
      return
    }

    await optimizeImages({
      skipMissing: true, // Skip if files don't exist
      silent: true // Don't show errors for missing files
    })

    console.log('✓ Favicons setup complete')
  } catch (error) {
    console.log('⚠️ Favicon generation skipped:', error instanceof Error ? error.message : 'Unknown error')
  }
}

setupFavicons() 