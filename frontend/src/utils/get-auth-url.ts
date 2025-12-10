function getBasePath(): string {
  return process.env.NODE_ENV === 'development'
    ? (process.env.NEXT_PUBLIC_BASE_PATH ?? '/templates')
    : '';
}

export function getAuthUrl(path: string): string {
  const basePath = getBasePath();

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}${basePath}${path}`;
  }

  const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;
  if (gatewayUrl) {
    return `${gatewayUrl}${basePath}${path}`;
  }

  return `http://localhost:3000${basePath}${path}`;
}
