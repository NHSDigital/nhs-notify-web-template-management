import { mockDeep } from 'jest-mock-extended';
import { render } from '@testing-library/react';
import { Redirect } from '@molecules/Redirect/Redirect';
import {
  useSearchParams,
  ReadonlyURLSearchParams,
  redirect,
} from 'next/navigation';

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  redirect: jest.fn(),
  useSearchParams: jest.fn(),
}));

test('Redirect - URL provided', () => {
  const mockRedirect = jest.fn(mockDeep<typeof redirect>());
  jest.mocked(redirect).mockImplementation(mockRedirect);

  const mockSearchParams = new ReadonlyURLSearchParams({
    redirect: 'redirect',
  });
  jest.mocked(useSearchParams).mockReturnValue(mockSearchParams);

  render(<Redirect />);

  expect(mockRedirect).toHaveBeenCalledWith('redirect');
});

test('Redirect - URL not provided', () => {
  const mockRedirect = jest.fn(mockDeep<typeof redirect>());
  jest.mocked(redirect).mockImplementation(mockRedirect);

  const mockSearchParams = new ReadonlyURLSearchParams({});
  jest.mocked(useSearchParams).mockReturnValue(mockSearchParams);

  render(<Redirect />);

  expect(mockRedirect).toHaveBeenCalledWith('/');
});
