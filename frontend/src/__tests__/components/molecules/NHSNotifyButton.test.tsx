import { fireEvent, render, screen } from '@testing-library/react';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';

describe('NHS Notify button', () => {
  afterEach(() => jest.useRealTimers());
  it('renders component correctly as a button', () => {
    render(
      <NHSNotifyButton data-testid='button'> Button text</NHSNotifyButton>
    );

    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toHaveTextContent('Button text');
  });

  it('renders component correctly as a link button', () => {
    render(
      <NHSNotifyButton data-testid='link-button' href='#'>
        {' '}
        Button text
      </NHSNotifyButton>
    );

    expect(screen.getByTestId('link-button')).toBeInTheDocument();
    expect(screen.getByTestId('link-button')).toHaveTextContent('Button text');
    expect(screen.getByTestId('link-button')).toHaveAttribute('href', '#');
  });

  it('debounces multiple clicks', async () => {
    const onClick = jest.fn();

    render(
      <NHSNotifyButton data-testid='button' onClick={onClick}>
        {' '}
        Button text
      </NHSNotifyButton>
    );

    const button = screen.getByTestId('button');

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('default onClick does nothing', async () => {
    const container = render(
      <NHSNotifyButton data-testid='button'>Button text</NHSNotifyButton>
    );

    const button = screen.getByTestId('button');

    fireEvent.click(button);

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('allows clicks with 1000ms intervals', async () => {
    jest.useFakeTimers();
    const onClick = jest.fn();

    render(
      <NHSNotifyButton data-testid='button' onClick={onClick}>
        Button text
      </NHSNotifyButton>
    );

    const button = screen.getByTestId('button');

    fireEvent.click(button);
    jest.advanceTimersByTime(1000);
    fireEvent.click(button);
    jest.advanceTimersByTime(500);
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
