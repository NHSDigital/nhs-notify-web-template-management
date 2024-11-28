import {
  Result,
  failure,
  ErrorCase,
  success,
} from 'nhs-notify-templates-client';
import { decode } from 'jsonwebtoken';
import { User } from './user';
import { validate } from '../../utils';
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
