import { readFileSync, writeFileSync } from 'node:fs';

const fileContent = readFileSync(
  './amplify_outputs.json',
  'utf8'
);

const jsonFileContent = JSON.parse(fileContent);

jsonFileContent.auth.user_pool_id = process.env.USER_POOL_ID;
jsonFileContent.auth.user_pool_client_id = process.env.USER_POOL_CLIENT_ID;
jsonFileContent.auth.identity_pool_id = process.env.IDENTITY_POOL_ID;

writeFileSync(
  './amplify_outputs.json',
  JSON.stringify(jsonFileContent),
  'utf8'
);
