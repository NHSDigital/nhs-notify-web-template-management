import { parse } from 'node-html-parser';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { globSync } from 'glob';

const BUILD_DIR = '.next/server';

const staticHtmlFiles = globSync(`${BUILD_DIR}/**/*.html`);

const CSP_HASHES_OUTFILE = 'csp-hashes.json';

const generateSha256CspHash = (value: string) => {
  return `sha256-${createHash('sha256').update(value).digest('base64')}`;
};

const cspHashes: string[] = [];

for (const htmlFile of staticHtmlFiles) {
  console.log(`Searching ${htmlFile} for inline <script> tags`);

  const file = parse(readFileSync(htmlFile).toString());

  const inlineScripts = file.querySelectorAll('body script');
  console.log(`Found ${inlineScripts.length} inline <script> tags`);

  console.log('Creating SHA-256 hashes for each script');

  for (const inlineScript of inlineScripts) {
    const innerTextScriptHash = generateSha256CspHash(inlineScript.text);

    inlineScript.setAttribute('integrity', innerTextScriptHash);

    cspHashes.push(`'${innerTextScriptHash}'`);
  }

  console.log(`Updating ${htmlFile} with new hashed scripts`);
  writeFileSync(htmlFile, file.toString());
}

// There may be duplicate hashes if the same resources are loaded two or more times, like
// when a <link> tag preloads a JS file and an inline script later consumes it.
const uniqueCspHashes = [...new Set(cspHashes)];

console.log(
  `Persisting the following hash information to ${CSP_HASHES_OUTFILE}: ${uniqueCspHashes}`
);
writeFileSync(CSP_HASHES_OUTFILE, JSON.stringify(uniqueCspHashes));
