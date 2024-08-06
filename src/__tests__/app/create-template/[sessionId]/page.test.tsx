'use server';

import CreateTemplate from '@/src/app/create-template/[sessionId]/page';
import { TemplateType } from '@/src/utils/types';
import { render } from '@testing-library/react';

const mockSession = {
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
  templateType: '',
};

jest.mock('@utils/form-actions', () => ({
  getSession: () => ({
    ...mockSession,
  }),
}));

jest.mock(
  '@molecules/CreateTemplateSinglePage/CreateTemplateSinglePage',
  () => ({
    CreateTemplateSinglePage: () => <p>mock component</p>,
  })
);

test('CreateTemplate with no selection', async () => {
  mockSession.templateType = 'UNKNOWN';

  const component = await CreateTemplate({
    params: { sessionId: 'session-id' },
  });

  const container = render(component);

  expect(container.asFragment()).toMatchSnapshot();
});

test('CreateTemplate with existing selection', async () => {
  mockSession.templateType = TemplateType.NHS_APP;

  const component = await CreateTemplate({
    params: { sessionId: 'session-id' },
  });

  const container = render(component);

  expect(container.asFragment()).toMatchSnapshot();
});
