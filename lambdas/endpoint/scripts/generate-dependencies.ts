import { readFileSync, writeFileSync } from 'node:fs';

const htmlContent = readFileSync(
  './src/email/email-template.html',
  'utf8'
).trim();

const encodedHtmlContent = JSON.stringify({ htmlContent });

writeFileSync('./src/email/email-template.json', encodedHtmlContent, 'utf8');
