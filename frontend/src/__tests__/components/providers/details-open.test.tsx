import {
  act,
  render,
  renderHook,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DetailsOpenButton,
  DetailsOpenProvider,
  updateDetailsOpenState,
  useDetailsOpen,
} from '@providers/details-open';

function TestComponent() {
  return (
    <DetailsOpenProvider targetClassName='details-section'>
      <DetailsOpenButton render={(isOpen) => (isOpen ? 'Close' : 'Open')} />
      <details className='details-section'>
        <summary>Details Section 1</summary>
        <p>Details Text 1</p>
      </details>
      <details>
        <summary>Details Section 2</summary>
        <p>Details Text 2</p>
      </details>
      <details className='details-section'>
        <summary>Details Section 3</summary>
        <p>Details Text 3</p>
      </details>
    </DetailsOpenProvider>
  );
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('DetailsOpenProvider', () => {
  it('renders children', () => {
    expect(render(<TestComponent />).asFragment()).toMatchSnapshot();
  });

  it('starts with details sections being closed', () => {
    render(<TestComponent />);

    const button = screen.getByRole('button');

    expect(button).toHaveTextContent('Open');

    const details = screen.getAllByRole('group');

    expect(details.length).toBe(3);

    for (const section of details) {
      expect(within(section).getByRole('paragraph')).not.toBeVisible();
    }
  });

  it('opens all child `details` elements with matching className', async () => {
    const user = await userEvent.setup();

    render(<TestComponent />);

    const button = screen.getByRole('button');

    await user.click(button);

    expect(button).toHaveTextContent('Close');

    const details = screen.getAllByRole('group');

    expect(details.length).toBe(3);

    expect(within(details[0]).getByRole('paragraph')).toBeVisible();
    expect(within(details[1]).getByRole('paragraph')).not.toBeVisible();
    expect(within(details[2]).getByRole('paragraph')).toBeVisible();
  });

  it('closes all child `details` elements with matching className once opened', async () => {
    const user = await userEvent.setup();

    render(<TestComponent />);

    const button = screen.getByRole('button');

    // Open the controlled sections
    await user.click(button);

    const details = screen.getAllByRole('group');

    // Open the uncontrolled section too
    await user.click(within(details[1]).getByText(/details section/i));
    expect(within(details[1]).getByRole('paragraph')).toBeVisible();

    // Close the controlled elements
    await user.click(button);

    expect(button).toHaveTextContent('Open');

    expect(within(details[0]).getByRole('paragraph')).not.toBeVisible();
    expect(within(details[1]).getByRole('paragraph')).toBeVisible();
    expect(within(details[2]).getByRole('paragraph')).not.toBeVisible();
  });
});

describe('useDetailsOpen', () => {
  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useDetailsOpen())).toThrow(
      'useDetailsOpen must be used within DetailsOpenProvider'
    );
  });

  it('returns the state and toggle function', () => {
    const { result } = renderHook(() => useDetailsOpen(), {
      wrapper: ({ children }) => (
        <DetailsOpenProvider targetClassName='target-class'>
          {children}
        </DetailsOpenProvider>
      ),
    });

    const [isOpenInitial, toggle] = result.current;

    expect(isOpenInitial).toBe(false);

    act(() => {
      toggle();
    });

    const [isOpenAfterToggle] = result.current;

    expect(isOpenAfterToggle).toBe(true);
  });
});

describe('updateDetailsOpenState', () => {
  it('does not query DOM when ref is null', () => {
    const querySelectorAllSpy = jest.spyOn(
      Element.prototype,
      'querySelectorAll'
    );

    updateDetailsOpenState(null, 'target-class', false);

    expect(querySelectorAllSpy).not.toHaveBeenCalled();
  });
});
