declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_BASE_URL: string;
      COGNITO_USER_POOL_CLIENT_ID: string;
      COGNITO_USER_POOL_ID: string;
      NEXT_PUBLIC_ENABLE_LETTERS: string;
      PLAYWRIGHT_RUN_ID: string;
      TEMPLATES_TABLE_NAME: string;
    }
  }

  namespace PlaywrightTest {
    interface Matchers<R> {
      toBeDateRoughlyBetween(range: [Date, Date]): R;
    }
  }
}

export {};
