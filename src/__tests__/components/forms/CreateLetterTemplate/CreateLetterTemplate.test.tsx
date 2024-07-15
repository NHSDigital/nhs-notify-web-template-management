import { CreateLetterTemplate } from '@forms/CreateLetterTemplate/CreateLetterTemplate';
import { render, screen } from '@testing-library/react';

describe('CreateLetterTemplate component', () => {
  it('should render', () => {
    render(<CreateLetterTemplate />);
    expect(screen.getByTestId('page-sub-heading')).toHaveTextContent(
      'Placeholder letter page'
    );
  });
});
