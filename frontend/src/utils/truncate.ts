export function truncate(str: string, maxLength: number): string {
  const trimmed = str.trimEnd();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return trimmed.slice(0, maxLength).trimEnd() + '…';
}
