export const getBasePath = () =>
  process.env.NEXT_PUBLIC_BASE_PATH ?? '/templates';

export const getAuthBasePath = () =>
  process.env.NEXT_PUBLIC_AUTH_BASE_PATH ?? '/auth~featuredomain-testing';
