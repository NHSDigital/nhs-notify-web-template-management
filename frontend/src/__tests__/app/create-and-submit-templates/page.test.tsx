import { render } from '@testing-library/react';
import HomePage from '@app/create-and-submit-templates/page';

const OLD_ENV = { ...process.env };

beforeEach(() => {
  jest.resetAllMocks();
  process.env.NEXT_PUBLIC_ENABLE_LETTERS = 'true';
});

afterAll(() => {
  process.env = OLD_ENV;
});

it('matches the snapshot', () => {
  const { container } = render(<HomePage />);
  expect(container).toMatchSnapshot();
});

it('matches the snapshot with letters feature flag disabled', () => {
  process.env.NEXT_PUBLIC_ENABLE_LETTERS = 'false';

  const { container } = render(<HomePage />);
  expect(container).toMatchSnapshot();
});
