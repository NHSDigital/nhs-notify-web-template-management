export const print = (message: string) =>
  console.log(`[${new Date().toUTCString()}] - ${message}`);
