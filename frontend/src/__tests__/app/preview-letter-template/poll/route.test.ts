/**
 * @jest-environment node
 */
import { GET } from '@app/preview-letter-template/[templateId]/poll/route';
import { getTemplate } from '@utils/form-actions';
import { NextRequest } from 'next/server';
import { AUTHORING_LETTER_TEMPLATE } from '@testhelpers/helpers';

jest.mock('@utils/form-actions');

const mockGetTemplate = jest.mocked(getTemplate);

function makeRequest(templateId: string) {
  return {
    request: new NextRequest(
      `http://localhost/preview-letter-template/${templateId}/poll`
    ),
    params: Promise.resolve({ templateId }),
  };
}

describe('GET /preview-letter-template/[templateId]/poll', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns the template as JSON when it exists', async () => {
    mockGetTemplate.mockResolvedValue(AUTHORING_LETTER_TEMPLATE);

    const { request, params } = makeRequest(AUTHORING_LETTER_TEMPLATE.id);
    const response = await GET(request, { params });
    const body = await response.json();

    expect(mockGetTemplate).toHaveBeenCalledWith(AUTHORING_LETTER_TEMPLATE.id);
    expect(body).toEqual(AUTHORING_LETTER_TEMPLATE);
  });

  it('returns null as JSON when the template does not exist', async () => {
    mockGetTemplate.mockResolvedValue(undefined);

    const { request, params } = makeRequest('unknown-id');
    const response = await GET(request, { params });
    const body = await response.json();

    expect(mockGetTemplate).toHaveBeenCalledWith('unknown-id');
    expect(body).toBeNull();
  });
});
