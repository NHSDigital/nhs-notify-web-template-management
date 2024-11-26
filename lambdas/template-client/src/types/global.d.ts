declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TEMPLATE_API_URL: string;
    }
  }
}

export {};
