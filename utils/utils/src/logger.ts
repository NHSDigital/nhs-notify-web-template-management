import winston from 'winston';

const { combine, timestamp, json, errors } = winston.format;

const deepDelete = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any,
  deleteKeys: string[],
  maxDepth = 2,
  currentDepth = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  if (obj && typeof obj === 'object' && currentDepth <= maxDepth) {
    for (const key of deleteKeys) {
      delete obj[key];
    }

    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        deepDelete(obj[key], deleteKeys, maxDepth, currentDepth + 1);
      }
    }
  }
  return obj;
};

export const deleteProps = (info: winston.Logform.TransformableInfo) => {
  return deepDelete(info, [
    // verbose AWS SDK response
    '$response',
  ]);
};

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    winston.format(deleteProps)(),
    errors({ stack: true, cause: true }),
    timestamp(),
    json()
  ),
  transports: [new winston.transports.Stream({ stream: process.stdout })],
});

export type Logger = winston.Logger;
