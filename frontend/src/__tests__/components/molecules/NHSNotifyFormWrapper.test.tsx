import { mockDeep } from 'jest-mock-extended';
import {
  NHSNotifyFormWrapper,
  csrfServerAction,
} from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { render } from '@testing-library/react';
import { verifyCsrfTokenFull } from '@utils/csrf-utils';

jest.mock("@utils/csrf-utils", () => ({
  verifyCsrfTokenFull: jest.fn(),
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

  test('server action', async () => {
    const mockAction = jest.fn(() => "response");
    const action = csrfServerAction(mockAction);

    if (typeof action === 'string') {
      throw new TypeError('Expected server action');
    }

    const mockFormData = mockDeep<FormData>();
    const response = await action(mockFormData);

    expect(verifyCsrfTokenFull).toHaveBeenCalledWith(mockFormData);
    expect(mockAction).toHaveBeenCalledWith(mockFormData);
  });
});
