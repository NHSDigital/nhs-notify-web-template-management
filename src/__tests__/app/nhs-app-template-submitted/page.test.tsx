import NhsAppTemplateSubmittedPage from '@app/nhs-app-template-submitted/[templateId]/page';
import { render } from '@testing-library/react';

test('NhsAppTemplateSubmittedPage', async () => {
  const page = await NhsAppTemplateSubmittedPage({ params: { templateId: '1'}});
  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});
