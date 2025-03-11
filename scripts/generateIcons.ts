import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const iconsDir = path.join(rootDir, 'src/domains/common/components/CIcon/icons');

if (!fs.existsSync(iconsDir)) {
  console.error(`Icons directory not found: ${iconsDir}`);
  console.error('Please ensure the icons directory exists and contains SVG files.');
  process.exit(1);
}

try {
  const files = fs.readdirSync(iconsDir);

  const iconNames = files
    .filter(file => file.endsWith('.svg'))
    .map(file => file.replace('.svg', ''));

  const content = `/**
 * @fileoverview Icon definitions with SVG components
 * @generated This file is auto-generated using 'npm run generate-icons'
 * @warning Do not modify this file directly. Add or update SVG files in the icons directory and run the generator
 */

${iconNames.map(name =>
  `import ${name.charAt(0).toUpperCase() + name.slice(1)} from './icons/${name}.svg?react';`
).join('\n')}

export const icons = {
  ${iconNames.map(name =>
    name.charAt(0).toUpperCase() + name.slice(1)
  ).join(',\n  ')},
} as const;

export type IconName = keyof typeof icons;
`;

  fs.writeFileSync(
    path.join(rootDir, 'src/domains/common/components/CIcon/icons.ts'),
    content
  );

  console.log('Icons file generated successfully!');
} catch (error) {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    console.error('Error generating icons file:', error.message);
  } else {
    console.error('An unknown error occurred.');
  }
  process.exit(1);
}
