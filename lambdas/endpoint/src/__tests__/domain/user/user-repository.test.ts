import { decode } from 'jsonwebtoken';
import { userRepository, $User } from '../../../domain/user';
import { validate } from '../../../utils/validate';

jest.mock('jsonwebtoken');
jest.mock('../../../utils/validate');

const decodeMock = jest.mocked(decode);
const validateMock = jest.mocked(validate);

describe('userRepository', () => {
  beforeEach(jest.resetAllMocks);

  test('should return error when, token cannot be decoded', () => {
    decodeMock.mockReturnValueOnce(null);

    validateMock.mockReturnValueOnce({
      error: {
        code: 400,
        message: 'Object is null',
      },
    });

    const response = userRepository.getUser('token');

    expect(response).toEqual({
      error: {
        code: 401,
        message:
          'User token is either null or does not contain a valid client_id',
      },
    });
  });

  test('should return user', () => {
    decodeMock.mockReturnValueOnce({ client_id: 'client-id' });

    validateMock.mockReturnValueOnce({
      data: {
        client_id: 'client-id',
      },
    });

    const response = userRepository.getUser('token');

    expect(validateMock).toHaveBeenCalledWith($User, {
      client_id: 'client-id',
    });

    expect(response).toEqual({
      data: {
        id: 'client-id',
      },
    });
  });
});
