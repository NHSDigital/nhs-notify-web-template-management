import InvalidTemplatePage from '@app/invalid-template/page.prod';
import { render } from '@testing-library/react';

test('InvalidTemplatePage', async () => {
  const container = render(<InvalidTemplatePage />);

  expect(container.asFragment()).toMatchSnapshot();
});
