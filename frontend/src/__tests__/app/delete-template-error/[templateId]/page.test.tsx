import { render } from '@testing-library/react';
import DeleteTemplateErrorPage, {
  generateMetadata,
} from '@app/delete-template-error/[templateId]/page';
import { getTemplate } from '@utils/form-actions';
import { getRoutingConfigReferencesByTemplateId } from '@utils/message-plans';
import type {
  TemplateDto,
  RoutingConfigReference,
} from 'nhs-notify-backend-client';
import { redirect } from 'next/navigation';
import { NextRedirectError } from '@testhelpers/next-redirect';
import DeleteTemplateError from '@molecules/DeleteTemplateError/DeleteTemplateError';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  RedirectType: { replace: 'replace', push: 'push' },
}));

jest.mocked(redirect).mockImplementation((url, type) => {
  throw new NextRedirectError(url, type);
});

jest.mock('@utils/form-actions', () => ({
  getTemplate: jest.fn(),
}));

jest.mock('@utils/message-plans', () => ({
  getRoutingConfigReferencesByTemplateId: jest.fn(),
}));

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);
const getRoutingConfigReferencesByTemplateIdMock = jest.mocked(
  getRoutingConfigReferencesByTemplateId
);

const mockTemplate: Extract<TemplateDto, { templateType: 'NHS_APP' }> = {
  id: 'template-123',
  name: 'Test Template',
  templateType: 'NHS_APP',
  templateStatus: 'NOT_YET_SUBMITTED',
  lockNumber: 1,
  message: 'Test message',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('DeleteTemplateError page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('has correct page title', async () => {
    const metadata = await generateMetadata();

    expect(metadata).toEqual({
      title: 'Delete template error - NHS Notify',
    });
  });

  test('redirects when template is not found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await expect(
      DeleteTemplateErrorPage({
        params: Promise.resolve({ templateId: 'non-existent-template' }),
      })
    ).rejects.toThrow(NextRedirectError);

    expect(getTemplateMock).toHaveBeenCalledWith('non-existent-template');
    expect(getRoutingConfigReferencesByTemplateIdMock).not.toHaveBeenCalled();
  });

  test('redirects when no message plans are linked to template', async () => {
    getTemplateMock.mockResolvedValueOnce(mockTemplate);
    getRoutingConfigReferencesByTemplateIdMock.mockResolvedValueOnce([]);

    await expect(
      DeleteTemplateErrorPage({
        params: Promise.resolve({ templateId: 'template-123' }),
      })
    ).rejects.toThrow(NextRedirectError);

    expect(getTemplateMock).toHaveBeenCalledWith('template-123');
    expect(getRoutingConfigReferencesByTemplateIdMock).toHaveBeenCalledWith(
      'template-123'
    );
  });

  test('displays error page when message plans are linked to template', async () => {
    const messagePlans: RoutingConfigReference[] = [
      { id: '90e46ece-4a3b-47bd-b781-f986b42a5a09', name: 'Message Plan 1' },
      { id: 'a0e46ece-4a3b-47bd-b781-f986b42a5a10', name: 'Message Plan 2' },
    ];

    getTemplateMock.mockResolvedValueOnce(mockTemplate);
    getRoutingConfigReferencesByTemplateIdMock.mockResolvedValueOnce(
      messagePlans
    );

    const result = await DeleteTemplateErrorPage({
      params: Promise.resolve({ templateId: 'template-123' }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-123');
    expect(getRoutingConfigReferencesByTemplateIdMock).toHaveBeenCalledWith(
      'template-123'
    );
    expect(redirectMock).not.toHaveBeenCalled();

    expect(result).toEqual(
      <DeleteTemplateError
        templateName='Test Template'
        messagePlans={messagePlans}
      />
    );
  });

  test('matches snapshot', async () => {
    const messagePlans: RoutingConfigReference[] = [
      { id: 'plan-1', name: 'Email Campaign' },
      { id: 'plan-2', name: 'SMS Notification' },
    ];

    getTemplateMock.mockResolvedValueOnce(mockTemplate);
    getRoutingConfigReferencesByTemplateIdMock.mockResolvedValueOnce(
      messagePlans
    );

    const page = await DeleteTemplateErrorPage({
      params: Promise.resolve({ templateId: 'template-789' }),
    });

    expect(render(page).asFragment()).toMatchSnapshot();
  });
});
