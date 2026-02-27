import PreviewNhsAppTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-nhs-app-template/[routingConfigId]/preview-template/[templateId]/page';
import { NHS_APP_TEMPLATE, ROUTING_CONFIG } from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('PreviewNhsAppTemplateFromMessagePlan page', () => {
  it('should redirect to the edit message plan page when lockNumber is invalid', async () => {
    await PreviewNhsAppTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({
        lockNumber: 'invalid',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/edit-message-plan/routing-config-id',
      'replace'
    );
  });

  it('should redirect to the edit message plan page when lockNumber is missing', async () => {
    await PreviewNhsAppTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({}),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/edit-message-plan/routing-config-id',
      'replace'
    );
  });

  it('should redirect to invalid page with invalid template id', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await PreviewNhsAppTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'invalid-template-id',
      }),
      searchParams: Promise.resolve({
        lockNumber: '0',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('invalid-template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('renders NHS App template preview', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...NHS_APP_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });

    const page = await PreviewNhsAppTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: NHS_APP_TEMPLATE.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: '5',
      }),
    });

    const container = render(page);

    expect(getTemplateMock).toHaveBeenCalledWith(NHS_APP_TEMPLATE.id);

    expect(await generateMetadata()).toEqual({
      title: 'Preview NHS App message template - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });
});
