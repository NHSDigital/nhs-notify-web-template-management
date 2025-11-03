export function getAuthUrl(path: string): string {
  const protocol = process.env.NODE_ENV === 'production' ? 'https:' : 'http:';
  const domain = process.env.NOTIFY_DOMAIN_NAME ?? 'localhost:3000';

  const basePath =
    process.env.NODE_ENV === 'development'
      ? (process.env.NEXT_PUBLIC_BASE_PATH ?? '/templates')
      : '';

  return `${protocol}//${domain}${basePath}${path}`;
}
