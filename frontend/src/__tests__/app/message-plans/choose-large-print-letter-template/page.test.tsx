import ChooseLargePrintLetterTemplate, {
  generateMetadata,
} from '@app/message-plans/choose-large-print-letter-template/[routingConfigId]/page';
import {
  LARGE_PRINT_LETTER_TEMPLATE,
  ROUTING_CONFIG,
} from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplates } from '@utils/form-actions';
import { getRoutingConfig } from '@utils/message-plans';

jest.mock('@utils/message-plans');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getRoutingConfigMock = jest.mocked(getRoutingConfig);
const getTemplatesMock = jest.mocked(getTemplates);

describe('ChooseLargePrintLetterTemplate page', () => {
  it('calls getTemplates with correct filters', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([LARGE_PRINT_LETTER_TEMPLATE]);

    await ChooseLargePrintLetterTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: '42',
      }),
    });

    expect(getRoutingConfigMock).toHaveBeenCalledWith(ROUTING_CONFIG.id);
    expect(getTemplatesMock).toHaveBeenCalledWith({
      templateType: 'LETTER',
      language: 'en',
      letterType: 'x1',
      templateStatus: ['SUBMITTED', 'PROOF_APPROVED'],
      letterVersion: 'AUTHORING',
      campaignId: ROUTING_CONFIG.campaignId,
    });
  });

  it('renders large print letter template selection', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([LARGE_PRINT_LETTER_TEMPLATE]);

    const page = await ChooseLargePrintLetterTemplate({
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
      templateType: 'LETTER',
      language: 'en',
      letterType: 'x1',
      templateStatus: ['SUBMITTED', 'PROOF_APPROVED'],
      letterVersion: 'AUTHORING',
      campaignId: ROUTING_CONFIG.campaignId,
    });

    expect(await generateMetadata()).toEqual({
      title: 'Choose a large print letter template - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders the empty state message when there are no templates', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([]);

    const page = await ChooseLargePrintLetterTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: '42',
      }),
    });

    const container = render(page);

    expect(container.getByTestId('no-templates-message').textContent).toBe(
      'You do not have any large print letter templates linked to the campaign you chose for this message plan.'
    );
    expect(container.asFragment()).toMatchSnapshot();
  });
});
