import { render } from '@testing-library/react';
import {
  LetterRenderErrorProvider,
  useLetterRenderError,
} from '@providers/letter-render-error-provider';

function TestConsumer() {
  useLetterRenderError();
  return null;
}

describe('useLetterRenderError', () => {
  it('throws when used outside provider', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      'useLetterRenderError must be used within LetterRenderErrorProvider'
    );
  });
});

describe('LetterRenderErrorProvider', () => {
  it('renders children without error', () => {
    expect(() =>
      render(
        <LetterRenderErrorProvider>
          <TestConsumer />
        </LetterRenderErrorProvider>
      )
    ).not.toThrow();
  });
});
