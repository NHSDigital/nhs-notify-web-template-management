import CreateEmailTemplatePage from '@app/create-email-template/[sessionId]/page.prod';
import { render } from '@testing-library/react';

test('CreateEmailTemplatePage', async () => {
  const page = await CreateEmailTemplatePage();
  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});
