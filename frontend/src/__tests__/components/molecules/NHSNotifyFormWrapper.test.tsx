import { mockDeep } from 'jest-mock-extended';
import {
  NHSNotifyFormWrapper,
  csrfServerAction,
} from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { render } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { verifyFormCsrfToken } from '@utils/csrf-utils';

jest.mock('next/navigation');

jest.mock('@utils/csrf-utils', () => ({
  verifyFormCsrfToken: jest.fn(),
}));

test('Renders back button', () => {
  const container = render(
    <NHSNotifyFormWrapper formId='form-id' action='/action'>
      <input id='input' value='4' readOnly />
    </NHSNotifyFormWrapper>
  );

  expect(container.asFragment()).toMatchSnapshot();
});

describe('csrfServerAction', () => {
  test('string action', async () => {
    const action = csrfServerAction('/action');

    expect(action).toEqual('/action');
  });

  test('server action with valid csrf check', async () => {
    jest.mocked(verifyFormCsrfToken).mockResolvedValueOnce(true);
    const mockAction = jest.fn();
    const action = csrfServerAction(mockAction);

    if (typeof action === 'string') {
      throw new TypeError('Expected server action');
    }

    const mockFormData = mockDeep<FormData>();
    await action(mockFormData);

    expect(verifyFormCsrfToken).toHaveBeenCalledWith(mockFormData);
    expect(mockAction).toHaveBeenCalledWith(mockFormData);
  });

  test('server action with failed csrf check', async () => {
    jest.mocked(verifyFormCsrfToken).mockResolvedValueOnce(false);

    const mockAction = jest.fn();
    const action = csrfServerAction(mockAction);

    if (typeof action === 'string') {
      throw new TypeError('Expected server action');
    }

    const mockFormData = mockDeep<FormData>();
    await action(mockFormData);

    expect(verifyFormCsrfToken).toHaveBeenCalledWith(mockFormData);
    expect(redirect).toHaveBeenCalledWith('/auth/signout');
    expect(mockAction).not.toHaveBeenCalled();
  });
});
