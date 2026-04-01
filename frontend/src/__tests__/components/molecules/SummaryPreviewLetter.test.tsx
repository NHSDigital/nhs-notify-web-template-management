import { SummaryPreviewLetter } from '@molecules/SummaryPreviewLetter/SummaryPreviewLetter';
import {
  AUTHORING_LETTER_TEMPLATE,
  PDF_LETTER_TEMPLATE,
  makeLetterVariant,
  ROUTING_CONFIG,
} from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getLetterVariantById, getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import {
  validateLetterTemplate,
  LetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const getLetterVariantByIdMock = jest.mocked(getLetterVariantById);
const redirectMock = jest.mocked(redirect);

const defaultProps = (
  overrides: {
    routingConfigId?: string;
    templateId?: string;
    lockNumber?: string;
    searchParams?: Record<string, string>;
    validateTemplate?: (template?: TemplateDto) => LetterTemplate | undefined;
    hideBackLinks?: boolean;
  } = {}
) => ({
  params: Promise.resolve({
    routingConfigId: overrides.routingConfigId ?? 'routing-config-id',
    templateId: overrides.templateId ?? 'template-id',
  }),
  searchParams: Promise.resolve(
    overrides.searchParams ?? { lockNumber: overrides.lockNumber ?? '5' }
  ),
  validateTemplate: overrides.validateTemplate ?? validateLetterTemplate,
  hideBackLinks: overrides.hideBackLinks,
});

describe('SummaryPreviewLetter', () => {
  it('should redirect to the edit message plan page when lockNumber is invalid', async () => {
    await SummaryPreviewLetter(defaultProps({ lockNumber: 'invalid' }));

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/edit-message-plan/routing-config-id',
      'replace'
    );
  });

  it('should redirect to the edit message plan page when lockNumber is missing', async () => {
    await SummaryPreviewLetter(defaultProps({ searchParams: {} }));

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/edit-message-plan/routing-config-id',
      'replace'
    );
  });

  it('should redirect to invalid-template when template is not found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await SummaryPreviewLetter(
      defaultProps({ templateId: 'invalid-template-id' })
    );

    expect(getTemplateMock).toHaveBeenCalledWith('invalid-template-id');
    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should redirect to invalid-template when template fails validation', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...PDF_LETTER_TEMPLATE,
      templateType: 'EMAIL',
    } as unknown as TemplateDto);

    await SummaryPreviewLetter(defaultProps());

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('renders a PDF letter template preview without letterVariant', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...PDF_LETTER_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });

    const page = await SummaryPreviewLetter(
      defaultProps({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: PDF_LETTER_TEMPLATE.id,
      })
    );

    const container = render(page);

    expect(getTemplateMock).toHaveBeenCalledWith(PDF_LETTER_TEMPLATE.id);
    expect(getLetterVariantByIdMock).not.toHaveBeenCalled();
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders an authoring letter template preview with letterVariant', async () => {
    const letterVariant = makeLetterVariant();

    getTemplateMock.mockResolvedValueOnce({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });
    getLetterVariantByIdMock.mockResolvedValueOnce(letterVariant);

    const page = await SummaryPreviewLetter(
      defaultProps({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: AUTHORING_LETTER_TEMPLATE.id,
      })
    );

    const container = render(page);

    expect(getTemplateMock).toHaveBeenCalledWith(AUTHORING_LETTER_TEMPLATE.id);
    expect(getLetterVariantByIdMock).toHaveBeenCalledWith('variant-123');
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('passes hideBackLinks to PreviewTemplateFromMessagePlan', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...PDF_LETTER_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });

    const page = await SummaryPreviewLetter(
      defaultProps({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: PDF_LETTER_TEMPLATE.id,
        hideBackLinks: true,
      })
    );

    const container = render(page);

    expect(container.asFragment()).toMatchSnapshot();
  });
});
