import { render, screen } from '@testing-library/react';
import { LetterSubmitButton } from '@molecules/LetterRender/LetterSubmitButton';
import { useLetterRenderPolling } from '@providers/letter-render-polling-provider';

jest.mock('@providers/letter-render-polling-provider');

describe('LetterSubmitButton', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders an enabled submit button when no tab is polling', () => {
    jest.mocked(useLetterRenderPolling).mockReturnValue({
      isAnyTabPolling: false,
      registerPolling: jest.fn(),
      tabErrorState: undefined,
      setTabErrorState: jest.fn(),
      pageErrorState: undefined,
      setPageErrorState: jest.fn(),
    });

    render(<LetterSubmitButton>Submit template</LetterSubmitButton>);

    const button = screen.getByRole('button', { name: 'Submit template' });

    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'false');

    expect(button).toHaveClass('nhsuk-button');
    expect(button).not.toHaveClass('nhsuk-button--disabled');
  });

  it('renders a disabled submit button when a tab is polling', () => {
    jest.mocked(useLetterRenderPolling).mockReturnValue({
      isAnyTabPolling: true,
      registerPolling: jest.fn(),
      tabErrorState: undefined,
      setTabErrorState: jest.fn(),
      pageErrorState: undefined,
      setPageErrorState: jest.fn(),
    });

    render(<LetterSubmitButton>Submit template</LetterSubmitButton>);

    const button = screen.getByRole('button', { name: 'Submit template' });

    expect(button).toBeDisabled();

    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass('nhsuk-button--disabled');
  });

  it('renders children as button text', () => {
    jest.mocked(useLetterRenderPolling).mockReturnValue({
      isAnyTabPolling: false,
      registerPolling: jest.fn(),
      tabErrorState: undefined,
      setTabErrorState: jest.fn(),
      pageErrorState: undefined,
      setPageErrorState: jest.fn(),
    });

    render(<LetterSubmitButton>Custom text</LetterSubmitButton>);

    expect(
      screen.getByRole('button', { name: 'Custom text' })
    ).toBeInTheDocument();
  });
});
