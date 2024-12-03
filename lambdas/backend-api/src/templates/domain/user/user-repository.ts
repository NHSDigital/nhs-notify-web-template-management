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

const getUser = async (token: string): Promise<ApplicationResult<User>> => {
  const payload = decode(token);

  const { data, error } = await validate($User, payload);

  if (error) {
    return failure(
      ErrorCase.UNAUTHORIZED,
      'User token is either null or does not contain a valid username',
      error.actualError
    );
  }

  return success({ id: data.username });
};

export const userRepository = {
  getUser,
};
