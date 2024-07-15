import { CreateEmailTemplate } from '@forms/CreateEmailTemplate/CreateEmailTemplate';
import { render, screen } from '@testing-library/react';

describe('CreateEmailTemplate component', () => {
  it('should render', () => {
    render(<CreateEmailTemplate />);
    expect(screen.getByTestId('page-sub-heading')).toHaveTextContent(
      'Placeholder email page'
    );
  });
});
