export const truncate = (text: string, maxLength: number = 50): string => {
  const trimmed = text.trimEnd();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return trimmed.slice(0, maxLength).trimEnd() + '…';
};
