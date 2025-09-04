#!/usr/bin/env tsx

import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';

// Modern color palette for the AI assistant
const COLORS = {
  primary: '#3B82F6',      // Blue
  secondary: '#8B5CF6',    // Purple
  accent: '#06B6D4',       // Cyan
  background: '#FFFFFF',   // White
  darkBackground: '#0F172A', // Dark slate
  text: '#1E293B',         // Dark slate
  lightText: '#64748B',    // Slate
  border: '#E2E8F0',       // Light slate
  success: '#10B981',      // Emerald
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
};

// Modern gradients
const GRADIENTS = {
  primary: {
    start: '#3B82F6',
    end: '#8B5CF6',
  },
  secondary: {
    start: '#06B6D4',
    end: '#3B82F6',
  },
  accent: {
    start: '#8B5CF6',
    end: '#EC4899',
  },
};

interface IconConfig {
  size: number;
  filename: string;
  format: 'png' | 'ico' | 'svg';
  background?: string;
  theme?: 'light' | 'dark' | 'both';
}

const ICON_SIZES: IconConfig[] = [
  // Favicons
  { size: 16, filename: 'favicon-16x16', format: 'png', theme: 'both' },
  { size: 32, filename: 'favicon-32x32', format: 'png', theme: 'both' },
  { size: 48, filename: 'favicon-48x48', format: 'png', theme: 'both' },
  { size: 180, filename: 'favicon-180x180', format: 'png', theme: 'both' },
  
  // App icons
  { size: 192, filename: 'android-chrome-192x192', format: 'png', theme: 'both' },
  { size: 512, filename: 'android-chrome-512x512', format: 'png', theme: 'both' },
  { size: 192, filename: 'apple-icon', format: 'png', theme: 'both' },
  
  // PWA icons
  { size: 64, filename: 'icon-64x64', format: 'png', theme: 'both' },
  { size: 128, filename: 'icon-128x128', format: 'png', theme: 'both' },
  { size: 256, filename: 'icon-256x256', format: 'png', theme: 'both' },
  
  // Legacy favicon
  { size: 32, filename: 'favicon', format: 'ico', theme: 'both' },
];

class ModernIconGenerator {
  private outputDir: string;

  constructor(outputDir: string = 'public') {
    this.outputDir = outputDir;
  }

  // Create a modern AI assistant icon
  private createModernIcon(size: number, theme: 'light' | 'dark' = 'light'): Buffer {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Set background
    const bgColor = theme === 'dark' ? COLORS.darkBackground : COLORS.background;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, GRADIENTS.primary.start);
    gradient.addColorStop(1, GRADIENTS.primary.end);
    
    // Draw main circle
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add subtle border
    ctx.strokeStyle = theme === 'dark' ? COLORS.border : COLORS.lightText;
    ctx.lineWidth = size * 0.02;
    ctx.stroke();
    
    // Draw AI brain/neural network pattern
    this.drawNeuralPattern(ctx, centerX, centerY, radius * 0.6, size, theme);
    
    // Add sparkle effect
    this.drawSparkles(ctx, size, theme);
    
    return canvas.toBuffer('image/png');
  }

  private drawNeuralPattern(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, size: number, theme: 'light' | 'dark') {
    const nodeColor = theme === 'dark' ? COLORS.background : COLORS.background;
    const lineColor = theme === 'dark' ? COLORS.lightText : COLORS.text;
    
    // Draw nodes
    const nodes = [
      { x: centerX - radius * 0.5, y: centerY - radius * 0.3 },
      { x: centerX + radius * 0.5, y: centerY - radius * 0.3 },
      { x: centerX, y: centerY + radius * 0.4 },
      { x: centerX - radius * 0.3, y: centerY },
      { x: centerX + radius * 0.3, y: centerY },
    ];
    
    // Draw connections
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = size * 0.015;
    ctx.globalAlpha = 0.6;
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
    
    // Draw nodes
    ctx.globalAlpha = 1;
    ctx.fillStyle = nodeColor;
    const nodeRadius = size * 0.03;
    
    for (const node of nodes) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  private drawSparkles(ctx: CanvasRenderingContext2D, size: number, theme: 'light' | 'dark') {
    const sparkleColor = theme === 'dark' ? COLORS.accent : COLORS.secondary;
    const sparkles = [
      { x: size * 0.2, y: size * 0.2, size: size * 0.02 },
      { x: size * 0.8, y: size * 0.3, size: size * 0.015 },
      { x: size * 0.15, y: size * 0.7, size: size * 0.025 },
      { x: size * 0.85, y: size * 0.8, size: size * 0.02 },
    ];
    
    ctx.fillStyle = sparkleColor;
    ctx.globalAlpha = 0.8;
    
    for (const sparkle of sparkles) {
      ctx.beginPath();
      ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  }

  // Generate SVG icon
  private generateSVG(size: number, theme: 'light' | 'dark' = 'light'): string {
    const bgColor = theme === 'dark' ? COLORS.darkBackground : COLORS.background;
    const primaryGradient = `url(#gradient-${theme})`;
    
    return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient-${theme}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${GRADIENTS.primary.start};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${GRADIENTS.primary.end};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${bgColor}" rx="${size * 0.1}"/>
  
  <!-- Main circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="${primaryGradient}" 
          stroke="${theme === 'dark' ? COLORS.border : COLORS.lightText}" 
          stroke-width="${size * 0.02}"/>
  
  <!-- Neural network nodes -->
  <g fill="${theme === 'dark' ? COLORS.background : COLORS.background}" opacity="0.9">
    <circle cx="${size/2 - size*0.175}" cy="${size/2 - size*0.105}" r="${size * 0.03}"/>
    <circle cx="${size/2 + size*0.175}" cy="${size/2 - size*0.105}" r="${size * 0.03}"/>
    <circle cx="${size/2}" cy="${size/2 + size*0.14}" r="${size * 0.03}"/>
    <circle cx="${size/2 - size*0.105}" cy="${size/2}" r="${size * 0.03}"/>
    <circle cx="${size/2 + size*0.105}" cy="${size/2}" r="${size * 0.03}"/>
  </g>
  
  <!-- Neural network connections -->
  <g stroke="${theme === 'dark' ? COLORS.lightText : COLORS.text}" 
     stroke-width="${size * 0.015}" opacity="0.6" fill="none">
    <line x1="${size/2 - size*0.175}" y1="${size/2 - size*0.105}" x2="${size/2 + size*0.175}" y2="${size/2 - size*0.105}"/>
    <line x1="${size/2 - size*0.175}" y1="${size/2 - size*0.105}" x2="${size/2}" y2="${size/2 + size*0.14}"/>
    <line x1="${size/2 + size*0.175}" y1="${size/2 - size*0.105}" x2="${size/2}" y2="${size/2 + size*0.14}"/>
    <line x1="${size/2 - size*0.175}" y1="${size/2 - size*0.105}" x2="${size/2 - size*0.105}" y2="${size/2}"/>
    <line x1="${size/2 + size*0.175}" y1="${size/2 - size*0.105}" x2="${size/2 + size*0.105}" y2="${size/2}"/>
    <line x1="${size/2 - size*0.105}" y1="${size/2}" x2="${size/2 + size*0.105}" y2="${size/2}"/>
    <line x1="${size/2 - size*0.105}" y1="${size/2}" x2="${size/2}" y2="${size/2 + size*0.14}"/>
    <line x1="${size/2 + size*0.105}" y1="${size/2}" x2="${size/2}" y2="${size/2 + size*0.14}"/>
  </g>
  
  <!-- Sparkles -->
  <g fill="${theme === 'dark' ? COLORS.accent : COLORS.secondary}" opacity="0.8">
    <circle cx="${size * 0.2}" cy="${size * 0.2}" r="${size * 0.02}"/>
    <circle cx="${size * 0.8}" cy="${size * 0.3}" r="${size * 0.015}"/>
    <circle cx="${size * 0.15}" cy="${size * 0.7}" r="${size * 0.025}"/>
    <circle cx="${size * 0.85}" cy="${size * 0.8}" r="${size * 0.02}"/>
  </g>
</svg>`.trim();
  }

  // Generate ICO file (simplified version)
  private generateICO(size: number): Buffer {
    // For simplicity, we'll create a PNG and save it as ICO
    // In a real implementation, you'd use a proper ICO library
    return this.createModernIcon(size, 'light');
  }

  // Generate all icons
  async generateAllIcons(): Promise<void> {
    console.log('🎨 Generating modern AI assistant icons...');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    for (const config of ICON_SIZES) {
      try {
        if (config.theme === 'both') {
          // Generate both light and dark versions
          await this.generateIcon(config.size, config.filename, config.format, 'light');
          await this.generateIcon(config.size, `${config.filename}-dark`, config.format, 'dark');
        } else {
          await this.generateIcon(config.size, config.filename, config.format, config.theme || 'light');
        }
        console.log(`✅ Generated ${config.filename} (${config.size}x${config.size})`);
      } catch (error) {
        console.error(`❌ Failed to generate ${config.filename}:`, error);
      }
    }

    // Generate additional modern assets
    await this.generateModernAssets();
    
    console.log('🎉 All modern icons generated successfully!');
  }

  private async generateIcon(size: number, filename: string, format: string, theme: 'light' | 'dark'): Promise<void> {
    const outputPath = path.join(this.outputDir, `${filename}.${format}`);
    
    if (format === 'svg') {
      const svgContent = this.generateSVG(size, theme);
      fs.writeFileSync(outputPath, svgContent);
    } else if (format === 'ico') {
      const icoBuffer = this.generateICO(size);
      fs.writeFileSync(outputPath, icoBuffer);
    } else {
      const pngBuffer = this.createModernIcon(size, theme);
      fs.writeFileSync(outputPath, pngBuffer);
    }
  }

  private async generateModernAssets(): Promise<void> {
    // Generate a modern logo for the overview component
    const logoBuffer = this.createModernIcon(64, 'light');
    fs.writeFileSync(path.join(this.outputDir, 'logo-modern.png'), logoBuffer);
    
    // Generate a dark version
    const logoDarkBuffer = this.createModernIcon(64, 'dark');
    fs.writeFileSync(path.join(this.outputDir, 'logo-modern-dark.png'), logoDarkBuffer);
    
    // Generate SVG versions
    const logoSVG = this.generateSVG(64, 'light');
    fs.writeFileSync(path.join(this.outputDir, 'logo-modern.svg'), logoSVG);
    
    const logoDarkSVG = this.generateSVG(64, 'dark');
    fs.writeFileSync(path.join(this.outputDir, 'logo-modern-dark.svg'), logoDarkSVG);
    
    console.log('✅ Generated modern logo assets');
  }
}

// Main execution
async function main() {
  const generator = new ModernIconGenerator();
  await generator.generateAllIcons();
}

if (require.main === module) {
  main().catch(console.error);
}

export { ModernIconGenerator };
