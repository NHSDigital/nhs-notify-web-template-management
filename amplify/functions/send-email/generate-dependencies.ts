import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlContent = readFileSync(
  path.resolve(dirname, './email-template.html'),
  'utf8'
).trim();

const encodedHtmlContent = JSON.stringify({ htmlContent });

writeFileSync(
  path.resolve(dirname, './email-template.json'),
  encodedHtmlContent,
  'utf8'
);
