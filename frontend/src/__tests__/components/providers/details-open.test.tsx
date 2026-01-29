import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DetailsOpenButton,
  DetailsOpenProvider,
  ControlledDetails,
} from '@providers/details-open';

function TestComponent() {
  return (
    <DetailsOpenProvider>
      <DetailsOpenButton openText='Close' closedText='Open' />
      <ControlledDetails>
        <summary>Details Section 1</summary>
        <p>Details Text 1</p>
      </ControlledDetails>
      <details>
        <summary>Details Section 2</summary>
        <p>Details Text 2</p>
      </details>
      <ControlledDetails>
        <summary>Details Section 3</summary>
        <p>Details Text 3</p>
      </ControlledDetails>
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

  it('opens all child `ControlledDetails` elements', async () => {
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

  it('closes all child `ControlledDetails` elements once opened', async () => {
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

describe('DetailsOpenButton', () => {
  it('throws when used outside provider', () => {
    expect(() =>
      render(<DetailsOpenButton openText='Close' closedText='Open' />)
    ).toThrow('useDetailsOpen must be used within DetailsOpenProvider');
  });
});

describe('ControlledDetails', () => {
  it('throws when used outside provider', () => {
    expect(() => render(<ControlledDetails />)).toThrow(
      'useDetailsOpen must be used within DetailsOpenProvider'
    );
  });
});
