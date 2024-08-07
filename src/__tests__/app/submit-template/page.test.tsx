import SubmitTemplatePage from '@/src/app/submit-template/[sessionId]/page';
import { render } from '@testing-library/react';

test('SubmitTemplatePage', async () => {
  const page = await SubmitTemplatePage();
  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});
