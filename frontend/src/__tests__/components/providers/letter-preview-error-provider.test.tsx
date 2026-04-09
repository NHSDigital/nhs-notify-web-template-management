import { render } from '@testing-library/react';
import {
  LetterPreviewErrorProvider,
  useLetterPreviewError,
} from '@providers/letter-preview-error-provider';

function TestConsumer() {
  useLetterPreviewError();
  return null;
}

describe('useLetterPreviewError', () => {
  it('throws when used outside provider', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      'useLetterPreviewError must be used within LetterPreviewErrorProvider'
    );
  });
});

describe('LetterPreviewErrorProvider', () => {
  it('renders children without error', () => {
    expect(() =>
      render(
        <LetterPreviewErrorProvider>
          <TestConsumer />
        </LetterPreviewErrorProvider>
      )
    ).not.toThrow();
  });
});
