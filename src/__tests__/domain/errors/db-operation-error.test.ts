import { DbOperationError } from '@domain/errors';

describe('DbOperationError', () => {
  it('defines the class constructor exits', () => {
    const dbOperationError = new DbOperationError({
      message: 'There was a problem creating record in the db',
      operation: 'create',
    });

    expect(typeof dbOperationError).toEqual('object');
  });
});
