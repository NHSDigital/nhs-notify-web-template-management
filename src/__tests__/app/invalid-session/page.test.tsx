import InvalidSessionPage from '@app/invalid-session/page.prod';
import { render } from '@testing-library/react';

test('InvalidSessionPage', async () => {
  const container = render(<InvalidSessionPage />);

  expect(container.asFragment()).toMatchSnapshot();
});
