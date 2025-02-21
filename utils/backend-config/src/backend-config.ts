/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'node:fs';

export type BackendConfig = {
  apiBaseUrl: string;
  templatesTableName: string;
  userPoolId: string;
  userPoolClientId: string;
};

export const BackendConfigHelper = {
  fromEnv(): BackendConfig {
    return {
      apiBaseUrl: process.env.API_BASE_URL ?? '',
      templatesTableName: process.env.TEMPLATES_TABLE_NAME ?? '',
      userPoolId: process.env.USER_POOL_ID ?? '',
      userPoolClientId: process.env.USER_POOL_CLIENT_ID ?? '',
    };
  },

  toEnv(config: BackendConfig): void {
    process.env.API_BASE_URL = config.apiBaseUrl;
    process.env.TEMPLATES_TABLE_NAME = config.templatesTableName;
    process.env.COGNITO_USER_POOL_ID = config.userPoolId;
    process.env.COGNITO_USER_POOL_CLIENT_ID = config.userPoolClientId;
  },

  fromTerraformOutputsFile(filepath: string): BackendConfig {
    const outputsFileContent = JSON.parse(fs.readFileSync(filepath, 'utf8'));

    return {
      apiBaseUrl: outputsFileContent.api_base_url?.value ?? '',
      templatesTableName: outputsFileContent.templates_table_name?.value ?? '',
      userPoolId: outputsFileContent.cognito_user_pool_id?.value ?? '',
      userPoolClientId:
        outputsFileContent.cognito_user_pool_client_id?.value ?? '',
    };
  },

  toAmplifyOutputs(config: BackendConfig, filepath: string): void {
    fs.writeFileSync(
      filepath,
      JSON.stringify(
        {
          version: '1.3',
          auth: {
            aws_region: 'eu-west-2',
            user_pool_id: config.userPoolId,
            user_pool_client_id: config.userPoolClientId,
          },
          meta: {
            api_base_url: config.apiBaseUrl,
            templates_table_name: config.templatesTableName,
          },
          storage: {
            aws_region: 'eu-west-2',
            bucket_name: 'pdf-upload-test-bucket-2',
          },
        },
        null,
        2
      )
    );
  },
};
