import {
  Result,
  failure,
  ErrorCase,
  success,
} from 'nhs-notify-templates-client';
import { decode, JwtPayload } from 'jsonwebtoken';
import { User } from './user';
import { validate } from '../../utils';
import { $User } from './user-schema';

type NotifyJwtPayload = JwtPayload & {
  client_id?: string;
};

const getUser = async (token: string): Promise<Result<User>> => {

  let payload: NotifyJwtPayload | null;
  try {
     payload = decode(token) as NotifyJwtPayload | null;
  }
  catch (error) {
    return failure(
      ErrorCase.UNAUTHORIZED,
      'Failed to decode user token',
      error
    );
  }

  const { data, error } = validate($User, payload);

  if (error) {
    return failure(
      ErrorCase.UNAUTHORIZED,
      'User token is either null or does not contain a valid client_id',
      error
    );
  }

  return success({ id: data.client_id });
};

export const userRepository = {
  getUser,
};
