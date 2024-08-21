import NhsAppTemplateSubmittedPage from '@app/nhs-app-template-submitted/[sessionId]/page';
import { render } from '@testing-library/react';

test('NhsAppTemplateSubmittedPage', async () => {
  const page = await NhsAppTemplateSubmittedPage();
  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});
