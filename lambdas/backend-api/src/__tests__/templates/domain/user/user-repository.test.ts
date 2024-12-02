import { decode } from 'jsonwebtoken';
import { userRepository, $User } from '@backend-api/templates/domain/user';
import { validate } from '@backend-api/utils/validate';

jest.mock('jsonwebtoken');
jest.mock('@backend-api/utils/validate');

const decodeMock = jest.mocked(decode);
const validateMock = jest.mocked(validate);

describe('userRepository', () => {
  beforeEach(jest.resetAllMocks);

  test('should return error when, token cannot be decoded', async () => {
    decodeMock.mockReturnValueOnce(null);

    validateMock.mockResolvedValue({
      error: {
        code: 400,
        message: 'Object is null',
      },
    });

    const response = await userRepository.getUser('token');

    expect(response).toEqual({
      error: {
        code: 403,
        message:
          'User token is either null or does not contain a valid client_id',
      },
    });
  });

  test('should return user', async () => {
    decodeMock.mockReturnValueOnce({ client_id: 'client-id' });

    validateMock.mockResolvedValue({
      data: {
        client_id: 'client-id',
      },
    });

    const response = await userRepository.getUser('token');

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
