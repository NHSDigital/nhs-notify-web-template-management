import { AUTHORING_LETTER_TEMPLATE } from '@testhelpers/helpers';
import { buildLetterRenderUrl } from '@utils/letter-render-url';

jest.mock('@utils/get-base-path', () => ({
  getBasePath: jest.fn(() => '/templates'),
}));

const { getBasePath } = jest.requireMock('@utils/get-base-path');

describe('buildLetterRenderUrl', () => {
  it('builds the URL using basePath, clientId, template id, and fileName', () => {
    expect(buildLetterRenderUrl(AUTHORING_LETTER_TEMPLATE, 'render.pdf')).toBe(
      `/templates/files/${AUTHORING_LETTER_TEMPLATE.clientId}/renders/${AUTHORING_LETTER_TEMPLATE.id}/render.pdf`
    );
  });

  it('uses the value returned by getBasePath', () => {
    getBasePath.mockReturnValueOnce('/custom');

    expect(buildLetterRenderUrl(AUTHORING_LETTER_TEMPLATE, 'file.pdf')).toBe(
      `/custom/files/${AUTHORING_LETTER_TEMPLATE.clientId}/renders/${AUTHORING_LETTER_TEMPLATE.id}/file.pdf`
    );
  });
});
