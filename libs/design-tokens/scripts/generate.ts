/* Regenerates the CSS token file. Run: `npx nx run design-tokens:generate` */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateTokensCss } from '../src/lib/css';

const out = join(__dirname, '..', 'src', 'generated', 'tokens.css');
writeFileSync(out, generateTokensCss(), 'utf8');
console.log(`design-tokens: wrote ${out}`);
