import PreviewLargePrintLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-large-print-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { render } from '@testing-library/react';
import { getLetterVariantById, getTemplate } from '@utils/form-actions';
import {
  useFeatureFlags,
  useCampaignIds,
} from '@providers/client-config-provider';
import {
  LARGE_PRINT_AUTHORING_TEMPLATE,
  makeLetterVariant,
  ROUTING_CONFIG,
} from '@testhelpers/helpers';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@providers/client-config-provider');

const getTemplateMock = jest.mocked(getTemplate);
const getLetterVariantByIdMock = jest.mocked(getLetterVariantById);

describe('PreviewLargePrintLetterTemplateFromMessagePlan page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useFeatureFlags).mockReturnValue({ routing: true });
    jest.mocked(useCampaignIds).mockReturnValue(['campaign-1', 'campaign-2']);
  });

  it('should render full page with large print letter template', async () => {
    const letterVariant = makeLetterVariant();

    getTemplateMock.mockResolvedValueOnce({
      ...LARGE_PRINT_AUTHORING_TEMPLATE,
      templateStatus: 'PROOF_APPROVED',
    });
    getLetterVariantByIdMock.mockResolvedValueOnce(letterVariant);

    const page = await PreviewLargePrintLetterTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: LARGE_PRINT_AUTHORING_TEMPLATE.id,
      }),
      searchParams: Promise.resolve({ lockNumber: '5' }),
    });

    const { asFragment } = render(page);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview large print letter template - NHS Notify',
    });
  });
});
