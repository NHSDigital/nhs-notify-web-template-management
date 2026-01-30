import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  ErrorState,
  FormState,
} from 'nhs-notify-web-template-management-utils';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import { createNhsNotifyFormContext } from '@providers/form-provider';
import { startTransition } from 'react';

jest.mock('@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary');

jest
  .mocked(NhsNotifyErrorSummary)
  .mockImplementation(() => <div data-testid='error-summary' />);

beforeEach(() => {
  jest.mocked(NhsNotifyErrorSummary).mockClear();
});

const { useNHSNotifyForm, NHSNotifyFormProvider } =
  createNhsNotifyFormContext();

function TestForm() {
  const [, action] = useNHSNotifyForm();

  return (
    <form action={action}>
      <input type='text' name='name' data-testid='name' />
      <button data-testid='submit'>Submit</button>
    </form>
  );
}

describe('NHSNotifyFormProvider', () => {
  it('renders the child form with the error summary before children', async () => {
    const container = render(
      <NHSNotifyFormProvider serverAction={jest.fn()}>
        <h1>Page Heading</h1>
        <TestForm />
      </NHSNotifyFormProvider>
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('calls the server action with the default initial state and completed form data when the form is submitted', async () => {
    const user = await userEvent.setup();

    const serverAction = jest.fn().mockResolvedValue({});
    render(
      <NHSNotifyFormProvider serverAction={serverAction}>
        <h1>Page Heading</h1>
        <TestForm />
      </NHSNotifyFormProvider>
    );

    await user.click(await screen.findByTestId('name'));
    await user.keyboard('Foo');

    await user.click(await screen.findByTestId('submit'));

    expect(serverAction).toHaveBeenCalledTimes(1);
    expect(serverAction).toHaveBeenCalledWith(
      {}, // default initial state
      expect.any(FormData)
    );
    const formData = serverAction.mock.lastCall?.at(1) as FormData;
    expect(formData.get('name')).toEqual('Foo');
  });

  it('renders the error summary with the errors returned from the server action', async () => {
    const user = await userEvent.setup();

    const errorState: ErrorState = { fieldErrors: { name: ['Name is empty'] } };

    const serverAction = jest.fn().mockResolvedValue({ errorState });
    render(
      <NHSNotifyFormProvider serverAction={serverAction}>
        <h1>Page Heading</h1>
        <TestForm />
      </NHSNotifyFormProvider>
    );

    await user.click(await screen.findByTestId('submit'));

    const lastErrorSummaryProps = jest
      .mocked(NhsNotifyErrorSummary)
      .mock.lastCall?.at(0);

    expect(lastErrorSummaryProps).toEqual({ errorState });
  });

  it('calls the server action with the given initial state when the form is submitted', async () => {
    const user = await userEvent.setup();

    const errorState: ErrorState = {
      fieldErrors: { name: ['Something is wrong with the name'] },
    };

    const serverAction = jest.fn().mockResolvedValue({});
    render(
      <NHSNotifyFormProvider
        serverAction={serverAction}
        initialState={{ errorState }}
      >
        <h1>Page Heading</h1>
        <TestForm />
      </NHSNotifyFormProvider>
    );

    await user.click(await screen.findByTestId('submit'));

    expect(serverAction).toHaveBeenCalledTimes(1);
    expect(serverAction).toHaveBeenCalledWith(
      { errorState },
      expect.any(FormData)
    );
  });
});

describe('useNHSNotifyForm', () => {
  test('throws when used outside provider', () => {
    expect(() => renderHook(() => useNHSNotifyForm())).toThrow(
      'useNHSNotifyForm must be used within NHSNotifyFormProvider'
    );
  });

  test('exposes state/action and updates after action', async () => {
    const serverAction = jest.fn(async (state: FormState, data: FormData) => {
      const name = data.get('name');
      return { ...state, name };
    });

    const { result } = renderHook(() => useNHSNotifyForm(), {
      wrapper: ({ children }) => (
        <NHSNotifyFormProvider serverAction={serverAction}>
          {children}
        </NHSNotifyFormProvider>
      ),
    });

    const [state, action] = result.current;
    expect(state).toEqual({});
    expect(serverAction).toHaveBeenCalledTimes(0);

    await act(async () => {
      const data = new FormData();
      data.append('name', 'Foo');
      startTransition(() => {
        action(data);
      });
    });

    expect(serverAction).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      const [latest] = result.current;
      expect(latest).toEqual({ name: 'Foo' });
    });
  });

  test('provided initialState is visible through the hook', () => {
    const initialState: FormState = {
      errorState: { fieldErrors: { name: ['Required'] } },
    };

    const serverAction = jest.fn(async (prev) => prev);

    const { result } = renderHook(() => useNHSNotifyForm(), {
      wrapper: ({ children }) => (
        <NHSNotifyFormProvider
          initialState={initialState}
          serverAction={serverAction}
        >
          {children}
        </NHSNotifyFormProvider>
      ),
    });
    const [state] = result.current;
    expect(state).toEqual(initialState);
  });
});
