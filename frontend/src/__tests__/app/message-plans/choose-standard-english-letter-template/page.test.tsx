import ChooseStandardEnglishLetterTemplate, {
  generateMetadata,
} from '@app/message-plans/choose-standard-english-letter-template/[routingConfigId]/page';
import { PDF_LETTER_TEMPLATE, ROUTING_CONFIG } from '@testhelpers/helpers';
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

describe('ChooseStandardEnglishLetterTemplate page', () => {
  it('should redirect to invalid page with invalid routing config id', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(undefined);

    await ChooseStandardEnglishLetterTemplate({
      params: Promise.resolve({
        routingConfigId: 'invalid-id',
      }),
      searchParams: Promise.resolve({
        lockNumber: '42',
      }),
    });

    expect(getRoutingConfigMock).toHaveBeenCalledWith('invalid-id');

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/invalid',
      'replace'
    );
  });

  it('should redirect to invalid if plan has no letter cascade entry', async () => {
    getRoutingConfigMock.mockResolvedValueOnce({
      ...ROUTING_CONFIG,
      cascade: ROUTING_CONFIG.cascade.filter(
        (item) => item.channel !== 'LETTER'
      ),
    });

    await ChooseStandardEnglishLetterTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: '42',
      }),
    });

    expect(getRoutingConfigMock).toHaveBeenCalledWith(ROUTING_CONFIG.id);

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/invalid',
      'replace'
    );
  });

  it('renders letter template selection', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([PDF_LETTER_TEMPLATE]);

    const page = await ChooseStandardEnglishLetterTemplate({
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
      letterType: 'x0',
      templateStatus: ['SUBMITTED', 'PROOF_APPROVED'],
    });

    expect(await generateMetadata()).toEqual({
      title: 'Choose a letter template - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('redirects to choose templates page if the lockNumber is missing', async () => {
    await ChooseStandardEnglishLetterTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      `/message-plans/choose-templates/${ROUTING_CONFIG.id}`,
      'replace'
    );
  });
});
