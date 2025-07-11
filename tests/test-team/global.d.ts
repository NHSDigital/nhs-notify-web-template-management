declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_BASE_URL: string;
      CLIENT_SSM_PATH_PREFIX: string;
      COGNITO_USER_POOL_CLIENT_ID: string;
      COGNITO_USER_POOL_ID: string;
      NEXT_PUBLIC_ENABLE_PROOFING: string;
      PLAYWRIGHT_RUN_ID: string;
      REQUEST_PROOF_QUEUE_URL: string;
      SFTP_ENVIRONMENT: string;
      SFTP_MOCK_CREDENTIAL_PATH: string;
      TEMPLATES_TABLE_NAME: string;
      TEMPLATES_INTERNAL_BUCKET_NAME: string;
      TEMPLATES_QUARANTINE_BUCKET_NAME: string;
      TEMPLATES_DOWNLOAD_BUCKET_NAME: string;
      TEST_TEMPLATE_SUBMITTED_EMAIL_PREFIX: string;
      TEST_PROOF_REQUESTED_EMAIL_PREFIX: string;
    }
  }

  namespace PlaywrightTest {
    interface Matchers<R> {
      toBeDateRoughlyBetween(range: [Date, Date]): R;
    }
  }
}

export {};
