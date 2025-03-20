import winston from 'winston';

const { combine, timestamp, json } = winston.format;

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.Stream({
      stream: process.stdout,
    }),
  ],
});

export type Logger = typeof logger;
export { logger };
