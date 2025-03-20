import axios, { AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { Result } from './types/result';
import { Failure } from './types/generated';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isApplicationFailure = (error: any): error is Failure =>
  'technicalMessage' in error;

export const createAxiosClient = () => {
  const client = axios.create({
    baseURL: process.env.API_BASE_URL,
  });
  axiosRetry(client, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: axiosRetry.isRetryableError,
  });

  return client;
};

export const catchAxiosError = async <T>(
  promise: Promise<AxiosResponse<T>>
): Promise<Result<T>> => {
  try {
    const response = await promise;

    return {
      data: response.data,
    };
  } catch (error) {
    const formattedError = {
      error: {
        code: 500,
        message: 'Something went wrong',
        details: error,
      },
    };

    if (axios.isAxiosError(error) && error.response) {
      const { response } = error;
      formattedError.error.code = response.status;

      if (isApplicationFailure(response.data)) {
        formattedError.error.message = response.data.technicalMessage;
        formattedError.error.details = response.data.details;
      }
    }

    return formattedError;
  }
};

export type AxiosRetryClient = ReturnType<typeof createAxiosClient>;
