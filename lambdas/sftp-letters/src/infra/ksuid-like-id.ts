const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function randomId() {
  return Array.from(
    { length: 27 },
    // eslint-disable-next-line sonarjs/pseudo-random
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}
