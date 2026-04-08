import { SummaryChooseLetter } from '@molecules/SummaryChooseLetter/SummaryChooseLetter';
import {
  AUTHORING_LETTER_TEMPLATE,
  makeLetterVariant,
  ROUTING_CONFIG,
} from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getLetterVariantById, getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { validateLetterTemplate } from 'nhs-notify-web-template-management-utils';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const getLetterVariantByIdMock = jest.mocked(getLetterVariantById);
const redirectMock = jest.mocked(redirect);

const defaultRedirectUrl = '/message-plans/edit-message-plan/routing-config-id';

const defaultProps = {
  params: Promise.resolve({
    routingConfigId: 'routing-config-id',
    templateId: 'template-id',
  }),
  searchParams: Promise.resolve({ lockNumber: '5' }),
  validateTemplate: validateLetterTemplate,
  redirectUrlOnLockNumberFailure: defaultRedirectUrl,
};

describe('SummaryChooseLetter', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should redirect when lockNumber is invalid', async () => {
    await SummaryChooseLetter({
      ...defaultProps,
      searchParams: Promise.resolve({ lockNumber: 'invalid' }),
      redirectUrlOnLockNumberFailure: '/custom-redirect',
    });

    expect(redirectMock).toHaveBeenCalledWith('/custom-redirect', 'replace');
  });

  it('should redirect when lockNumber is missing', async () => {
    await SummaryChooseLetter({
      ...defaultProps,
      searchParams: Promise.resolve({}),
    });

    expect(redirectMock).toHaveBeenCalledWith(defaultRedirectUrl, 'replace');
  });

  it('should redirect to invalid-template when template is not found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await SummaryChooseLetter({
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

    await SummaryChooseLetter(defaultProps);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('renders a letter template preview', async () => {
    const letterVariant = makeLetterVariant();

    getTemplateMock.mockResolvedValueOnce({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });
    getLetterVariantByIdMock.mockResolvedValueOnce(letterVariant);

    const page = await SummaryChooseLetter({
      ...defaultProps,
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: AUTHORING_LETTER_TEMPLATE.id,
      }),
    });

    const container = render(page);

    expect(getTemplateMock).toHaveBeenCalledWith(AUTHORING_LETTER_TEMPLATE.id);
    expect(getLetterVariantByIdMock).toHaveBeenCalledWith('variant-123');
    expect(container.asFragment()).toMatchSnapshot();
  });
});
