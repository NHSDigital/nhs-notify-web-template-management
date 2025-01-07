const { writeFileSync, readFileSync } = require('node:fs');

const inputType = process.argv[2];

let backendApiUrl;

if (inputType === 'file') {
  const outputsFileContent = JSON.parse(
    readFileSync('./sandbox_tf_outputs.json').toString()
  );

  backendApiUrl = outputsFileContent.api_base_url.value;

} else if (inputType === 'env') {
  backendApiUrl = process.env.BACKEND_API_URL ?? 'unknown-backend-api-url';

} else {
  throw new Error('Unexpected input type');
}

writeFileSync(
  './frontend/.env',
  [
    `BACKEND_API_URL=${backendApiUrl}`,
  ].join('\n')
);
