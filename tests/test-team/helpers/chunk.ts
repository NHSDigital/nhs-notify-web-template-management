/**
 * Breaks a list into chunks of upto 25 items
 */
export function chunk<T>(list: T[], size = 25): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < list.length; i += size) {
    chunks.push(list.slice(i, i + size));
  }

  return chunks;
}
