/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'node:fs';

export type BackendConfig = {
  apiBaseUrl: string;
  clientSsmPathPrefix: string;
  eventCacheBucketName: string;
  requestProofQueueUrl: string;
  routingConfigTableName: string;
  sftpEnvironment: string;
  sftpPollLambdaName: string;
  sftpMockCredentialPath: string;
  templatesTableName: string;
  templatesInternalBucketName: string;
  templatesQuarantineBucketName: string;
  templatesDownloadBucketName: string;
  testEmailBucketName: string;
  testEmailBucketPrefix: string;
  userPoolId: string;
  userPoolClientId: string;
};

export const BackendConfigHelper = {
  fromEnv(): BackendConfig {
    return {
      apiBaseUrl: process.env.API_BASE_URL ?? '',
      clientSsmPathPrefix: process.env.CLIENT_SSM_PATH_PREFIX ?? '',
      eventCacheBucketName: process.env.EVENT_CACHE_BUCKET_NAME ?? '',
      requestProofQueueUrl: process.env.REQUEST_PROOF_QUEUE_URL ?? '',
      routingConfigTableName: process.env.ROUTING_CONFIG_TABLE_NAME ?? '',
      sftpEnvironment: process.env.SFTP_ENVIRONMENT ?? '',
      sftpMockCredentialPath: process.env.SFTP_MOCK_CREDENTIAL_PATH ?? '',
      templatesTableName: process.env.TEMPLATES_TABLE_NAME ?? '',
      templatesInternalBucketName:
        process.env.TEMPLATES_INTERNAL_BUCKET_NAME ?? '',
      templatesQuarantineBucketName:
        process.env.TEMPLATES_QUARANTINE_BUCKET_NAME ?? '',
      templatesDownloadBucketName:
        process.env.TEMPLATES_DOWNLOAD_BUCKET_NAME ?? '',
      userPoolId: process.env.USER_POOL_ID ?? '',
      userPoolClientId: process.env.USER_POOL_CLIENT_ID ?? '',
      sftpPollLambdaName: process.env.SFTP_POLL_LAMBDA_NAME ?? '',
      testEmailBucketName: process.env.TEST_EMAIL_BUCKET_NAME ?? '',
      testEmailBucketPrefix: process.env.TEST_EMAIL_BUCKET_PREFIX ?? '',
    };
  },

  toEnv(config: BackendConfig): void {
    process.env.API_BASE_URL = config.apiBaseUrl;
    process.env.CLIENT_SSM_PATH_PREFIX = config.clientSsmPathPrefix;
    process.env.EVENT_CACHE_BUCKET_NAME = config.eventCacheBucketName;
    process.env.COGNITO_USER_POOL_ID = config.userPoolId;
    process.env.COGNITO_USER_POOL_CLIENT_ID = config.userPoolClientId;
    process.env.TEMPLATES_TABLE_NAME = config.templatesTableName;
    process.env.REQUEST_PROOF_QUEUE_URL = config.requestProofQueueUrl;
    process.env.ROUTING_CONFIG_TABLE_NAME = config.routingConfigTableName;
    process.env.SFTP_ENVIRONMENT = config.sftpEnvironment;
    process.env.SFTP_MOCK_CREDENTIAL_PATH = config.sftpMockCredentialPath;
    process.env.TEMPLATES_INTERNAL_BUCKET_NAME =
      config.templatesInternalBucketName;
    process.env.TEMPLATES_QUARANTINE_BUCKET_NAME =
      config.templatesQuarantineBucketName;
    process.env.TEMPLATES_DOWNLOAD_BUCKET_NAME =
      config.templatesDownloadBucketName;
    process.env.SFTP_POLL_LAMBDA_NAME = config.sftpPollLambdaName;
    process.env.TEST_EMAIL_BUCKET_NAME = config.testEmailBucketName;
    process.env.TEST_EMAIL_BUCKET_PREFIX = config.testEmailBucketPrefix;
  },

  fromTerraformOutputsFile(filepath: string): BackendConfig {
    const outputsFileContent = JSON.parse(fs.readFileSync(filepath, 'utf8'));

    return {
      apiBaseUrl: outputsFileContent.api_base_url?.value ?? '',
      clientSsmPathPrefix:
        outputsFileContent.client_ssm_path_prefix?.value ?? '',
      eventCacheBucketName:
        outputsFileContent.event_cache_bucket_name?.value ?? '',
      requestProofQueueUrl:
        outputsFileContent.request_proof_queue_url?.value ?? '',
      routingConfigTableName:
        outputsFileContent.routing_config_table_name?.value ?? '',
      sftpEnvironment: outputsFileContent.sftp_environment?.value ?? '',
      sftpMockCredentialPath:
        outputsFileContent.sftp_mock_credential_path?.value ?? '',
      templatesTableName: outputsFileContent.templates_table_name?.value ?? '',
      templatesInternalBucketName:
        outputsFileContent.internal_bucket_name?.value ?? '',
      templatesQuarantineBucketName:
        outputsFileContent.quarantine_bucket_name?.value ?? '',
      templatesDownloadBucketName:
        outputsFileContent.download_bucket_name?.value ?? '',
      userPoolId: outputsFileContent.cognito_user_pool_id?.value ?? '',
      userPoolClientId:
        outputsFileContent.cognito_user_pool_client_id?.value ?? '',
      sftpPollLambdaName: outputsFileContent.sftp_poll_lambda_name?.value ?? '',
      testEmailBucketName:
        outputsFileContent.test_email_bucket_name.value ?? '',
      testEmailBucketPrefix:
        outputsFileContent.test_email_bucket_prefix?.value ?? '',
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
          },
        },
        null,
        2
      )
    );
  },
};
