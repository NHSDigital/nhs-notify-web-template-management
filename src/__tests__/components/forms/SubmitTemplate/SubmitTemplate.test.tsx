import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { render, screen } from '@testing-library/react';

describe('SubmitTemplate component', () => {
  it('should render', () => {
    render(<SubmitTemplate />);
    expect(screen.getByTestId('page-sub-heading')).toHaveTextContent(
      'Placeholder Submit template'
    );
  });
});
