import fs from 'node:fs';
import path from 'node:path';

export function parseSandboxOutputs() {
  const outputs = JSON.parse(
    fs.readFileSync(
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'sandbox_tf_outputs.json'
      ),
      'utf8'
    )
  );

  process.env.API_BASE_URL = outputs.api_base_url.value;
  process.env.COGNITO_USER_POOL_ID = outputs.cognito_user_pool_id.value;
  process.env.COGNITO_USER_POOL_CLIENT_ID =
    outputs.cognito_user_pool_client_id.value;
  process.env.TEMPLATES_TABLE_NAME = outputs.templates_table_name.value;
}
