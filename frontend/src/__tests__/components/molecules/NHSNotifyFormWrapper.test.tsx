import { render } from '@testing-library/react';
import {
  NHSNotifyFormWrapper,
  csrfServerAction,
} from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { mockDeep } from 'jest-mock-extended';

jest.mock('@utils/csrf-utils');

test('Renders back button', () => {
  const container = render(
    <NHSNotifyFormWrapper
      formId='form-id'
      action='/action'
      csrfToken='csrf-token'
    >
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
    const action = csrfServerAction(() => 'response');

    if (typeof action === 'string') {
      throw new TypeError('Expected server action');
    }

    const response = await action(mockDeep<FormData>());

    expect(response).toEqual('response');
  });
});
