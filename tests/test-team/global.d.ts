declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TEMPLATE_STORAGE_TABLE_NAME: string;
      COGNITO_USER_POOL_ID: string;
      USER_TEMPORARY_PASSWORD: string;
      USER_PASSWORD: string;
      USER_EMAIL: string;
      USER_ID: string;
    }
  }
}

export {};
