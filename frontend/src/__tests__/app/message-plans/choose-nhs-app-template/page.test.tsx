import ChooseNhsAppTemplate, {
  generateMetadata,
} from '@app/message-plans/choose-nhs-app-template/[routingConfigId]/page';
import { NHS_APP_TEMPLATE, ROUTING_CONFIG } from '@testhelpers/helpers';
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
  .mockReturnValue('message-plans/choose-nhs-app-template/testid');

describe('ChooseNHSAppTemplate page', () => {
  it('renders NHS App template selection', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([NHS_APP_TEMPLATE]);

    const page = await ChooseNhsAppTemplate({
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
      templateType: 'NHS_APP',
    });

    expect(await generateMetadata()).toEqual({
      title: 'Choose an NHS App template - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders the empty state message when there are no templates', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([]);

    const page = await ChooseNhsAppTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: '42',
      }),
    });

    const container = render(page);

    expect(container.asFragment()).toMatchSnapshot();
  });
});
