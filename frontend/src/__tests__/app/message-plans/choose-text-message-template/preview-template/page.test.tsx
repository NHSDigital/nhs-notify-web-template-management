import PreviewTextMessageTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-text-message-template/[routingConfigId]/preview-template/[templateId]/page';
import { ROUTING_CONFIG, SMS_TEMPLATE } from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('PreviewTextMessageTemplateFromMessagePlan page', () => {
  beforeEach(jest.resetAllMocks);

  it('should redirect to invalid page with invalid template id', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await PreviewTextMessageTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'invalid-template-id',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('invalid-template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('renders SMS template preview', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...SMS_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });

    const page = await PreviewTextMessageTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: SMS_TEMPLATE.id,
      }),
    });

    const container = render(page);

    expect(getTemplateMock).toHaveBeenCalledWith(SMS_TEMPLATE.id);

    expect(await generateMetadata()).toEqual({
      title: 'Preview text message template - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });
});
