import { PreviewLetterFromMessagePlanPreview } from '@molecules/PreviewLetterFromMessagePlanPreview/PreviewLetterFromMessagePlanPreview';
import {
  AUTHORING_LETTER_TEMPLATE,
  makeLetterVariant,
  ROUTING_CONFIG,
} from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getLetterVariantById, getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const getLetterVariantByIdMock = jest.mocked(getLetterVariantById);
const redirectMock = jest.mocked(redirect);

const defaultProps = {
  params: Promise.resolve({
    routingConfigId: 'routing-config-id',
    templateId: 'template-id',
  }),
  searchParams: Promise.resolve({}),
};

describe('PreviewLetterFromMessagePlanPreview', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should redirect to invalid-template when template is not found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await PreviewLetterFromMessagePlanPreview({
      ...defaultProps,
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'invalid-template-id',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('invalid-template-id');
    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should redirect to invalid-template when template fails validation', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...AUTHORING_LETTER_TEMPLATE,
      templateType: 'EMAIL',
    } as unknown as TemplateDto);

    await PreviewLetterFromMessagePlanPreview(defaultProps);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should redirect to invalid-template when authoring letter template has no letterVariantId', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'SUBMITTED',
      letterVariantId: undefined,
    });

    await PreviewLetterFromMessagePlanPreview(defaultProps);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    expect(getLetterVariantByIdMock).not.toHaveBeenCalled();
  });

  it('renders with null pdfUrl when initialRender is not RENDERED', async () => {
    const letterVariant = makeLetterVariant();

    getTemplateMock.mockResolvedValueOnce({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'SUBMITTED',
      files: {
        ...AUTHORING_LETTER_TEMPLATE.files,
        initialRender: {
          status: 'PENDING',
          requestedAt: '2026-02-27T09:42:04.142Z',
        },
      },
    });
    getLetterVariantByIdMock.mockResolvedValueOnce(letterVariant);

    const page = await PreviewLetterFromMessagePlanPreview({
      ...defaultProps,
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: AUTHORING_LETTER_TEMPLATE.id,
      }),
    });

    const container = render(page);

    expect(container.asFragment()).toMatchSnapshot();
  });
});
