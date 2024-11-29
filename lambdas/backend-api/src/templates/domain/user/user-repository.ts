import { decode } from 'jsonwebtoken';
import { ErrorCase } from 'nhs-notify-backend-client';
import {
  validate,
  failure,
  success,
  ApplicationResult,
} from '@backend-api/utils/index';
import { User } from './user';
import { $User } from './user-schema';

const getUser = (token: string): ApplicationResult<User> => {
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
