import { ErrorPage404 } from '@molecules/404/404';
import { render } from '@testing-library/react';

test('ErrorPage404', async () => {
  const container = render(<ErrorPage404 />);

  expect(container.asFragment()).toMatchSnapshot();
});
