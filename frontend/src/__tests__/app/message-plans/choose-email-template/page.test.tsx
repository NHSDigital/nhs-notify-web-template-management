import ChooseEmailTemplate, {
  generateMetadata,
} from '@app/message-plans/choose-email-template/[routingConfigId]/page';
import { EMAIL_TEMPLATE, ROUTING_CONFIG } from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplates } from '@utils/form-actions';
import { getRoutingConfig } from '@utils/message-plans';

jest.mock('@utils/message-plans');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getRoutingConfigMock = jest.mocked(getRoutingConfig);
const getTemplatesMock = jest.mocked(getTemplates);

describe('ChooseEmailTemplate page', () => {
  it('renders Email template selection', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([EMAIL_TEMPLATE]);

    const page = await ChooseEmailTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: '42',
      }),
    });

    const container = render(page);

    expect(getRoutingConfigMock).toHaveBeenCalledWith(ROUTING_CONFIG.id);
    expect(getTemplatesMock).toHaveBeenCalledWith({
      templateType: 'EMAIL',
    });

    expect(await generateMetadata()).toEqual({
      title: 'Choose an email template - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders the empty state message when there are no templates', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([]);

    const page = await ChooseEmailTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: '42',
      }),
    });

    const container = render(page);

    expect(container.getByTestId('no-templates-message').textContent).toBe(
      'You do not have any email templates yet.'
    );
    expect(container.asFragment()).toMatchSnapshot();
  });
});
