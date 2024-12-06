import CreateLetterTemplatePage from '@app/create-letter-template/[templateId]/page';
import { render } from '@testing-library/react';

test('CreateLetterTemplatePage', async () => {
  const page = await CreateLetterTemplatePage();
  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});
