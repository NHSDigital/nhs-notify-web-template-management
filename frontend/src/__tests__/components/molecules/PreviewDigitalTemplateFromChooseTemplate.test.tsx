import { PreviewDigitalTemplateFromChooseTemplate } from '@molecules/PreviewDigitalTemplateFromChooseTemplate/PreviewDigitalTemplateFromChooseTemplate';
import {
  EMAIL_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
  ROUTING_CONFIG,
} from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import {
  validateEmailTemplate,
  validateNHSAppTemplate,
  validateSMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

const MockDetailComponent = ({ template }: { template: TemplateDto }) => (
  <div data-testid='mock-detail'>{template.name}</div>
);

const defaultProps = {
  params: Promise.resolve({
    routingConfigId: 'routing-config-id',
    templateId: 'template-id',
  }),
  searchParams: Promise.resolve({ lockNumber: '5' }),
  validateTemplate: validateEmailTemplate,
  DetailComponent: MockDetailComponent,
};

describe('PreviewDigitalTemplateFromChooseTemplate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should redirect when lockNumber is invalid', async () => {
    await PreviewDigitalTemplateFromChooseTemplate({
      ...defaultProps,
      searchParams: Promise.resolve({ lockNumber: 'invalid' }),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/edit-message-plan/routing-config-id',
      'replace'
    );
  });

  it('should redirect when lockNumber is missing', async () => {
    await PreviewDigitalTemplateFromChooseTemplate({
      ...defaultProps,
      searchParams: Promise.resolve({}),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/edit-message-plan/routing-config-id',
      'replace'
    );
  });

  it('should redirect to invalid-template when template is not found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await PreviewDigitalTemplateFromChooseTemplate({
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
      ...EMAIL_TEMPLATE,
      templateType: 'LETTER',
    } as unknown as TemplateDto);

    await PreviewDigitalTemplateFromChooseTemplate(defaultProps);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('renders Email template preview with correct back links', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...EMAIL_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });

    const page = await PreviewDigitalTemplateFromChooseTemplate({
      ...defaultProps,
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: EMAIL_TEMPLATE.id,
      }),
      validateTemplate: validateEmailTemplate,
      DetailComponent: MockDetailComponent,
    });

    const container = render(page);

    expect(getTemplateMock).toHaveBeenCalledWith(EMAIL_TEMPLATE.id);
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders NHS App template preview with correct back links', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...NHS_APP_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });

    const page = await PreviewDigitalTemplateFromChooseTemplate({
      ...defaultProps,
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: NHS_APP_TEMPLATE.id,
      }),
      validateTemplate: validateNHSAppTemplate,
      DetailComponent: MockDetailComponent,
    });

    const container = render(page);

    expect(getTemplateMock).toHaveBeenCalledWith(NHS_APP_TEMPLATE.id);
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders SMS template preview with correct back links', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...SMS_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });

    const page = await PreviewDigitalTemplateFromChooseTemplate({
      ...defaultProps,
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: SMS_TEMPLATE.id,
      }),
      validateTemplate: validateSMSTemplate,
      DetailComponent: MockDetailComponent,
    });

    const container = render(page);

    expect(getTemplateMock).toHaveBeenCalledWith(SMS_TEMPLATE.id);
    expect(container.asFragment()).toMatchSnapshot();
  });
});
