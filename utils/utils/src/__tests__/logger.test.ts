/* eslint-disable @typescript-eslint/no-require-imports */
import { deleteProps } from '../logger';

describe('logger', () => {
  const OLD_ENV = { ...process.env };

  beforeEach(jest.resetModules);

  afterEach(() => {
    process.env = OLD_ENV;
  });

  test('logger - should produce a logger with default log level', () => {
    const { logger } = require('../logger');

    expect(logger.info).toBeTruthy();
    expect(logger.error).toBeTruthy();
    expect(logger.warn).toBeTruthy();
    expect(logger.debug).toBeTruthy();

    expect(logger.level).toBe('info');
  });

  test('logger - should produce a logger with custom log level', () => {
    process.env.LOG_LEVEL = 'debug';
    const { logger } = require('../logger');

    expect(logger.level).toBe('debug');
  });
});

describe('deleteProps', () => {
  test('removes $response from top level of log object', () => {
    const log = {
      level: 'error',
      message: 'err',
      $response: {},
    };
    deleteProps(log);
    expect(log.$response).toBeUndefined();
  });

  test('removes nested $response field from log object', () => {
    const log = {
      level: 'error',
      message: 'err',
      cause: {
        message: 'err_cause',
        $response: {},
      },
    };
    deleteProps(log);
    expect(log.cause.$response).toBeUndefined();
  });

  test('can strip a $response field from an object in an array', () => {
    const log = {
      level: 'error',
      message: 'err',
      errors: [{ $response: {} }],
    };
    deleteProps(log);
    expect(log.errors[0].$response).toBeUndefined();
  });

  test('does not remove nested $response field from log object when its more than 2 levels deep', () => {
    const log = {
      level: 'error',
      message: 'err',
      cause: {
        message: 'err_cause',
        cause: {
          $response: {},
          cause: {
            $response: {},
          },
        },
      },
    };
    deleteProps(log);
    expect(log.cause.cause.$response).toBeUndefined();
    expect(log.cause.cause.cause.$response).toBeDefined();
  });
});
