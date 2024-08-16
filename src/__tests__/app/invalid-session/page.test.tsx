import InvalidSessionPage from '@app/invalid-session/page';
import { render } from '@testing-library/react';

test('InvalidSessionPage', async () => {
  const page = await InvalidSessionPage();
  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});
