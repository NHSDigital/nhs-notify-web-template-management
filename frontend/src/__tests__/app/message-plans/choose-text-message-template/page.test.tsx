import ChooseTextMessageTemplate, {
  generateMetadata,
} from '@app/message-plans/choose-text-message-template/[routingConfigId]/page';
import { ROUTING_CONFIG, SMS_TEMPLATE } from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplates } from '@utils/form-actions';
import { getRoutingConfig } from '@utils/message-plans';
import { usePathname } from 'next/navigation';

jest.mock('@utils/message-plans');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getRoutingConfigMock = jest.mocked(getRoutingConfig);
const getTemplatesMock = jest.mocked(getTemplates);
jest
  .mocked(usePathname)
  .mockReturnValue('message-plans/choose-text-message-template/testid');

describe('ChooseTextMessageTemplate page', () => {
  it('renders sms template selection', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([SMS_TEMPLATE]);

    const page = await ChooseTextMessageTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
      searchParams: Promise.resolve({ lockNumber: '42' }),
    });

    const container = render(page);

    expect(getRoutingConfigMock).toHaveBeenCalledWith(ROUTING_CONFIG.id);
    expect(getTemplatesMock).toHaveBeenCalledWith({
      templateType: 'SMS',
    });

    expect(await generateMetadata()).toEqual({
      title: 'Choose a text message (SMS) template - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders the empty state message when there are no templates', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([]);

    const page = await ChooseTextMessageTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
      searchParams: Promise.resolve({ lockNumber: '42' }),
    });

    const container = render(page);

    expect(container.getByTestId('no-templates-message').textContent).toBe(
      'You do not have any text message (SMS) templates yet.'
    );
    expect(container.asFragment()).toMatchSnapshot();
  });
});
