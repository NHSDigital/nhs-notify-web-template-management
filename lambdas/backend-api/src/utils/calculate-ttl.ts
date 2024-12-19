export const calculateTTL = () => {
  const currentTimeSeconds = Math.floor(Date.now() / 1000);

  const maxSessionLengthInSeconds = Number.parseInt(
    process.env.MAX_SESSION_LENGTH_IN_SECONDS ?? '2592000',
    10
  ); // 30 days in seconds

  return currentTimeSeconds + maxSessionLengthInSeconds;
};
