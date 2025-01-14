declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_BASE_URL: string;
      COGNITO_USER_POOL_CLIENT_ID: string;
      COGNITO_USER_POOL_ID: string;
      PLAYWRIGHT_RUN_ID: string;

      /**
       * The name of the Terraform managed DynamoDB table
       */
      TEMPLATES_TABLE_NAME: string;

      /**
       * The name of the Amplify managed DynamoDB table
       */
      TEMPLATE_STORAGE_TABLE_NAME: string;
    }
  }

  namespace PlaywrightTest {
    interface Matchers<R> {
      toBeDateRoughlyBetween(range: [Date, Date]): R;
    }
  }
}

export {};
