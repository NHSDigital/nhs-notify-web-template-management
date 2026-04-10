import { render, screen } from '@testing-library/react';
import {
  LetterRenderErrorProvider,
  useLetterRenderError,
} from '@providers/letter-render-error-provider';

function TestConsumer() {
  useLetterRenderError();
  return <div>child content</div>;
}

describe('useLetterRenderError', () => {
  it('throws when used outside provider', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      'useLetterRenderError must be used within LetterRenderErrorProvider'
    );
  });
});

describe('LetterRenderErrorProvider', () => {
  it('renders children', () => {
    render(
      <LetterRenderErrorProvider>
        <TestConsumer />
      </LetterRenderErrorProvider>
    );

    expect(screen.getByText('child content')).toBeInTheDocument();
  });
});
