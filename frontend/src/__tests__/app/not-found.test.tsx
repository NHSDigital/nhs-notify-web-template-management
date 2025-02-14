import NotFound from '@app/not-found';
import { render } from '@testing-library/react';

test('InvalidTemplatePage', () => {
  const container = render(<NotFound />);

  expect(container.asFragment()).toMatchSnapshot();
});
