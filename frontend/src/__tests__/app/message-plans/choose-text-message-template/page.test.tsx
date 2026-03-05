import ChooseTextMessageTemplate, {
  generateMetadata,
} from '@app/message-plans/choose-text-message-template/[routingConfigId]/page';
import { ROUTING_CONFIG, SMS_TEMPLATE } from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplates } from '@utils/form-actions';
import { getRoutingConfig } from '@utils/message-plans';
import { redirect, usePathname } from 'next/navigation';

jest.mock('@utils/message-plans');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getRoutingConfigMock = jest.mocked(getRoutingConfig);
const getTemplatesMock = jest.mocked(getTemplates);
const redirectMock = jest.mocked(redirect);
jest
  .mocked(usePathname)
  .mockReturnValue('message-plans/choose-text-message-template/testid');

describe('ChooseTextMessageTemplate page', () => {
  it('should redirect to invalid page with invalid routing config id', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(undefined);

    await ChooseTextMessageTemplate({
      params: Promise.resolve({
        routingConfigId: 'invalid-id',
      }),
      searchParams: Promise.resolve({ lockNumber: '42' }),
    });

    expect(getRoutingConfigMock).toHaveBeenCalledWith('invalid-id');

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/invalid',
      'replace'
    );
  });

  it('should redirect to invalid if plan has no sms cascade entry', async () => {
    getRoutingConfigMock.mockResolvedValueOnce({
      ...ROUTING_CONFIG,
      cascade: ROUTING_CONFIG.cascade.filter((item) => item.channel !== 'SMS'),
    });

    await ChooseTextMessageTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
      searchParams: Promise.resolve({ lockNumber: '42' }),
    });

    expect(getRoutingConfigMock).toHaveBeenCalledWith(ROUTING_CONFIG.id);

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/invalid',
      'replace'
    );
  });

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

  it('redirects to the edit message plan page if the lockNumber is missing', async () => {
    await ChooseTextMessageTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      `/message-plans/edit-message-plan/${ROUTING_CONFIG.id}`,
      'replace'
    );
  });
});
