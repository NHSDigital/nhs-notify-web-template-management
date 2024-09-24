import InvalidSessionPage from '@app/invalid-session/page';
import { render } from '@testing-library/react';

test('InvalidSessionPage', async () => {
  const container = render(<InvalidSessionPage />);

  expect(container.asFragment()).toMatchSnapshot();
});
