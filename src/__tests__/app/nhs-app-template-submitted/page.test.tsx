import nav from 'next/navigation';
import NhsAppTemplateSubmittedPage from '@app/nhs-app-template-submitted/[templateId]/page';
import { render } from '@testing-library/react';

jest.mock('@utils/form-actions', () => ({
  getTemplate: (templateId: string) => {
    if (templateId === 'template-id') {
      return {
        id: 'template-id',
        name: 'template-name',
      };
    }
  },
}));

jest.mock('next/navigation', () => ({
  redirect: () => {
    throw new Error('Simulated redirect');
  },
  useRouter: () => {},

  RedirectType: {
    push: 'push',
    replace: 'replace',
  },
}));

test('NhsAppTemplateSubmittedPage', async () => {
  const page = await NhsAppTemplateSubmittedPage({
    params: {
      templateId: 'template-id',
    },
  });

  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});

test('NhsAppTemplateSubmittedPage - should handle invalid session', async () => {
  const redirectSpy = jest.spyOn(nav, 'redirect');

  await expect(
    NhsAppTemplateSubmittedPage({
      params: {
        templateId: 'invalid-template',
      },
    })
  ).rejects.toThrow('Simulated redirect');

  expect(redirectSpy).toHaveBeenCalledWith('/invalid-template', 'replace');
});
