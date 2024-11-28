/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
export enum ErrorCase {
  TEMPLATE_NOT_FOUND = 404,
  VALIDATION_FAILED = 400,
  UNAUTHORIZED = 401,
  TEMPLATE_NOT_CREATED = 500,
  TEMPLATE_NOT_UPDATED = 500,
  DATABASE_FAILURE = 500,
  TEMPLATE_ALREADY_SUBMITTED = 400,
}