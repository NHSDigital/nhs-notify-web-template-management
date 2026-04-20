import PreviewLetterTemplateFromReviewAndMoveToProduction, {
  generateMetadata,
} from '@app/message-plans/review-and-move-to-production/[routingConfigId]/preview-template/[templateId]/page';
import { render } from '@testing-library/react';
import { getLetterVariantById, getTemplate } from '@utils/form-actions';
import {
  useFeatureFlags,
  useCampaignIds,
} from '@providers/client-config-provider';
import {
  AUTHORING_LETTER_TEMPLATE,
  makeLetterVariant,
  ROUTING_CONFIG,
} from '@testhelpers/helpers';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@providers/client-config-provider');

const getTemplateMock = jest.mocked(getTemplate);
const getLetterVariantByIdMock = jest.mocked(getLetterVariantById);

describe('PreviewLetterTemplateFromReviewAndMoveToProduction page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useFeatureFlags).mockReturnValue({ routing: true });
    jest.mocked(useCampaignIds).mockReturnValue(['campaign-1', 'campaign-2']);
  });

  it('should render full page with letter template', async () => {
    const letterVariant = makeLetterVariant();

    getTemplateMock.mockResolvedValueOnce({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });
    getLetterVariantByIdMock.mockResolvedValueOnce(letterVariant);

    const page = await PreviewLetterTemplateFromReviewAndMoveToProduction({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: AUTHORING_LETTER_TEMPLATE.id,
      }),
    });

    const { asFragment } = render(page);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview letter template - NHS Notify',
    });
  });
});
