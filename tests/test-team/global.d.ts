declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TEMPLATE_STORAGE_TABLE_NAME: string;
    }
  }
}

export {};
