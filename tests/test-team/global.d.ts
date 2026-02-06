declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_BASE_URL: string;
      AWS_ACCOUNT_ID: string;
      CLIENT_SSM_PATH_PREFIX: string;
      COGNITO_USER_POOL_CLIENT_ID: string;
      COGNITO_USER_POOL_ID: string;
      ENVIRONMENT: string;
      EVENTS_SNS_TOPIC_ARN: string;
      PLAYWRIGHT_RUN_ID: string;
      REQUEST_PROOF_QUEUE_URL: string;
      ROUTING_CONFIG_TABLE_NAME: string;
      SFTP_ENVIRONMENT: string;
      SFTP_MOCK_CREDENTIAL_PATH: string;
      TEMPLATES_TABLE_NAME: string;
      TEMPLATES_INTERNAL_BUCKET_NAME: string;
      TEMPLATES_QUARANTINE_BUCKET_NAME: string;
      TEMPLATES_DOWNLOAD_BUCKET_NAME: string;
      TEST_EMAIL_BUCKET_PREFIX: string;
      TEST_EMAIL_BUCKET_NAME: string;
    }
  }

  namespace PlaywrightTest {
    interface Matchers<R> {
      toBeDateRoughlyBetween(range: [Date, Date]): R;
    }
  }
}

export {};
