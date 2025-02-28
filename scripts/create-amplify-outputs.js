const { writeFileSync, readFileSync } = require('node:fs');

const inputType = process.argv[2];

let userPoolId;
let userPoolClientId;
let dynamoTableName;
let backendApiUrl;

if (inputType === 'file') {
  const outputsFileContent = JSON.parse(
    readFileSync('./sandbox_tf_outputs.json').toString()
  );

  userPoolId = outputsFileContent.cognito_user_pool_id.value;

  userPoolClientId = outputsFileContent.cognito_user_pool_client_id.value;

  dynamoTableName = outputsFileContent.dynamodb_table_templates.value;

  backendApiUrl = outputsFileContent.api_base_url.value;

} else if (inputType === 'env') {
  userPoolId = process.env.USER_POOL_ID ?? 'unknown-user-pool-id';

  userPoolClientId =
    process.env.USER_POOL_CLIENT_ID ?? 'unknown-user-pool-client-id';

  dynamoTableName = process.env.DYNAMO_TABLE_NAME ?? 'unknown-dynamo-table-name';

  backendApiUrl =
    process.env.BACKEND_API_URL ?? 'unknown-backend-api-url';
} else {
  throw new Error('Unexpected input type');
}

writeFileSync(
  './frontend/amplify_outputs.json',
  JSON.stringify({
    version: '1.3',
    auth: {
      aws_region: 'eu-west-2',
      user_pool_id: userPoolId,
      user_pool_client_id: userPoolClientId,
    },
    meta: {
      dynamo_table_name: dynamoTableName,
      backend_api_url: backendApiUrl,
    }
  }, null, 2)
);
