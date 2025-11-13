import ChooseEmailTemplate, {
  generateMetadata,
} from '@app/message-plans/choose-email-template/[routingConfigId]/page';
import { EMAIL_TEMPLATE, ROUTING_CONFIG } from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplates } from '@utils/form-actions';
import { getRoutingConfig } from '@utils/message-plans';
import { redirect } from 'next/navigation';

jest.mock('@utils/message-plans');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getRoutingConfigMock = jest.mocked(getRoutingConfig);
const getTemplatesMock = jest.mocked(getTemplates);
const redirectMock = jest.mocked(redirect);

describe('ChooseEmailTemplate page', () => {
  it('should redirect to invalid page with invalid routing config id', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(undefined);

    await ChooseEmailTemplate({
      params: Promise.resolve({
        routingConfigId: 'invalid-id',
      }),
    });

    expect(getRoutingConfigMock).toHaveBeenCalledWith('invalid-id');

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/invalid',
      'replace'
    );
  });

  it('should redirect to invalid if plan has no email cascade entry', async () => {
    getRoutingConfigMock.mockResolvedValueOnce({
      ...ROUTING_CONFIG,
      cascade: ROUTING_CONFIG.cascade.filter(
        (item) => item.channel !== 'EMAIL'
      ),
    });

    await ChooseEmailTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
    });

    expect(getRoutingConfigMock).toHaveBeenCalledWith(ROUTING_CONFIG.id);

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/invalid',
      'replace'
    );
  });

  it('renders Email template selection', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([EMAIL_TEMPLATE]);

    const page = await ChooseEmailTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
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
});
