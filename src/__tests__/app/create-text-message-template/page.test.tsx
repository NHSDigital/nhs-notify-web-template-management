import CreateSmsTemplatePage from '@app/create-text-message-template/[sessionId]/page';
import { render } from '@testing-library/react';

test('CreateSmsTemplatePage', async () => {
  const page = await CreateSmsTemplatePage();
  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});
