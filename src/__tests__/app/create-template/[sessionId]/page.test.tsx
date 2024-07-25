'use server';

import CreateTemplate from '@/src/app/create-template/[sessionId]/page';
import { render } from '@testing-library/react';

jest.mock('@utils/form-actions', () => ({
  getSession: () => ({
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
  }),
}));

jest.mock(
  '@molecules/CreateTemplateSinglePage/CreateTemplateSinglePage',
  () => ({
    CreateTemplateSinglePage: () => <p>mock component</p>,
  })
);

test('CreateTemplate', async () => {
  const component = await CreateTemplate({
    params: { sessionId: 'session-id' },
  });

  const container = render(component);

  expect(container.asFragment()).toMatchSnapshot();
});
