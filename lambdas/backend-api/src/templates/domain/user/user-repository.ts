import { decode } from 'jsonwebtoken';
import { Result, failure, ErrorCase, success } from 'nhs-notify-backend-client';
import { validate } from '@backend-api/utils/validate';
import { User } from './user';
import { $User } from './user-schema';

const getUser = (token: string): Result<User> => {
  const payload = decode(token);

  const { data, error } = validate($User, payload);

  if (error) {
    return failure(
      ErrorCase.UNAUTHORIZED,
      'User token is either null or does not contain a valid client_id',
      error.actualError
    );
  }

  return success({ id: data.client_id });
};

export const userRepository = {
  getUser,
};
