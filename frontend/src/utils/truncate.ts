export const truncate = (text: string, maxLength = 50): string => {
  return text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text;
};
