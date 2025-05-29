import { render } from '@testing-library/react';
import HomePage from '@app/create-and-submit-templates/page';

beforeEach(() => {
  jest.resetAllMocks();
});

it('matches the snapshot', () => {
  const { container } = render(<HomePage />);
  expect(container).toMatchSnapshot();
});
