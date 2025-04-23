import winston from 'winston';
import { Writable } from 'node:stream';

const { combine, timestamp, json, errors } = winston.format;

export function createMockLogger() {
  const logMessages: Record<string, unknown>[] = [];

  const logger = winston.createLogger({
    level: 'info',
    format: combine(timestamp(), json(), errors({ stack: true, cause: true })),
    transports: [
      new winston.transports.Stream({
        stream: new Writable({
          write: (msg, _, cb) => {
            logMessages.push(JSON.parse(msg));
            cb();
          },
        }),
      }),
    ],
  });

  const reset = () => {
    logMessages.length = 0;
  };

  return { logger, logMessages, reset };
}
