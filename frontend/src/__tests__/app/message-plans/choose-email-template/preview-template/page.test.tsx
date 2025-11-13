import PreviewEmailTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-email-template/[routingConfigId]/preview-template/[templateId]/page';
import { EMAIL_TEMPLATE, ROUTING_CONFIG } from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('PreviewEmailTemplateFromMessagePlan page', () => {
  it('should redirect to invalid page with invalid template id', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await PreviewEmailTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'invalid-template-id',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('invalid-template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('renders Email template preview', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...EMAIL_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });

    const page = await PreviewEmailTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: EMAIL_TEMPLATE.id,
      }),
    });

    const container = render(page);

    expect(getTemplateMock).toHaveBeenCalledWith(EMAIL_TEMPLATE.id);

    expect(await generateMetadata()).toEqual({
      title: 'Preview email template - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });
});
