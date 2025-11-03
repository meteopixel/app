/**
 * Script to generate Pixelarticons icon mappings from the pixelarticons package
 * Run with: bun run scripts/generate-pixelart-icons.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const PIXELARTICONS_PATH = path.join(__dirname, '../node_modules/pixelarticons/svg');
const OUTPUT_PATH = path.join(__dirname, '../constants/pixelart-icons.ts');

function extractPathFromSVG(svgContent: string): string | null {
  // Extract all path data from SVG - handle different attribute orders
  // Match <path ... d="..." ...> or <path d="..." ...>
  const pathMatches = svgContent.matchAll(/<path[^>]*\s+d="([^"]+)"/g);
  const paths: string[] = [];
  
  for (const match of pathMatches) {
    if (match[1]) {
      paths.push(match[1]);
    }
  }
  
  if (paths.length === 0) {
    return null;
  }
  
  // If multiple paths, combine them (for react-native-svg, we can render multiple Path components)
  // For now, return the first path as a simple solution
  // TODO: Support multi-path icons by returning an array or rendering multiple Path components
  return paths[0];
}

function generateIconMappings(): void {
  if (!fs.existsSync(PIXELARTICONS_PATH)) {
    console.error(`Pixelarticons path not found: ${PIXELARTICONS_PATH}`);
    console.error('Make sure pixelarticons is installed: bun add pixelarticons');
    process.exit(1);
  }

  const svgFiles = fs.readdirSync(PIXELARTICONS_PATH).filter(file => file.endsWith('.svg'));
  
  const iconMappings: Record<string, string> = {};
  const iconNames: string[] = [];

  for (const file of svgFiles) {
    const iconName = file.replace('.svg', '');
    const svgPath = path.join(PIXELARTICONS_PATH, file);
    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    const pathData = extractPathFromSVG(svgContent);

    if (pathData) {
      iconMappings[iconName] = pathData;
      iconNames.push(iconName);
    } else {
      console.warn(`Warning: Could not extract path from ${file}`);
    }
  }

  // Generate TypeScript file
  const typeName = iconNames.map(name => `  | '${name}'`).join('\n');
  const mappings = Object.entries(iconMappings)
    .map(([name, path]) => `  '${name}': '${path}',`)
    .join('\n');

  const output = `/**
 * Auto-generated Pixelarticons icon mappings
 * Generated from pixelarticons package - DO NOT EDIT MANUALLY
 * Run: bun run scripts/generate-pixelart-icons.ts to regenerate
 */

export type PixelartIconName =\n${typeName};

export const PIXELART_ICON_PATHS: Record<PixelartIconName, string> = {\n${mappings}\n} as const;

`;

  fs.writeFileSync(OUTPUT_PATH, output, 'utf-8');
  console.log(`✅ Generated ${iconNames.length} icon mappings to ${OUTPUT_PATH}`);
}

generateIconMappings();

