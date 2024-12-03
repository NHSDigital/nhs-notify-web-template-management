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
        code: 401,
        message:
          'User token is either null or does not contain a valid username',
      },
    });
  });

  test('should return user', async () => {
    decodeMock.mockReturnValueOnce({ username: 'username' });

    validateMock.mockResolvedValue({
      data: {
        username: 'username',
      },
    });

    const response = await userRepository.getUser('token');

    expect(validateMock).toHaveBeenCalledWith($User, {
      username: 'username',
    });

    expect(response).toEqual({
      data: {
        id: 'username',
      },
    });
  });
});
