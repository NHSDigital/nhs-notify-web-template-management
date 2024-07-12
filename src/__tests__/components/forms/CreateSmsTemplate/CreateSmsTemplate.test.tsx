import { CreateSmsTemplate } from '@forms/CreateSmsTemplate/CreateSmsTemplate';
import { render, screen } from '@testing-library/react';

describe('CreateSmsTemplate component', () => {
  it('should render', () => {
    render(<CreateSmsTemplate />);
    expect(screen.getByTestId('page-sub-heading')).toHaveTextContent(
      'Placeholder SMS page'
    );
  });
});
