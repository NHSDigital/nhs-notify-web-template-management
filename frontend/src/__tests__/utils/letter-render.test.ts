import type {
  RenderDetailsFailed,
  RenderDetailsPending,
  RenderDetailsRendered,
} from 'nhs-notify-web-template-management-types';
import { AUTHORING_LETTER_TEMPLATE } from '@testhelpers/helpers';
import { getRenderDetails, RenderedFileKey } from '@utils/letter-render';

jest.mock('@utils/get-base-path', () => ({
  getBasePath: () => '/templates',
}));

describe('getRenderDetails', () => {
  describe.each([
    'initialRender',
    'longFormRender',
    'shortFormRender',
  ] as RenderedFileKey[])('render is present - %s', (renderKey) => {
    it('builds the URL using basePath, clientId, template id, and fileName', () => {
      const template = {
        ...AUTHORING_LETTER_TEMPLATE,
      };

      template.files[renderKey] = {
        currentVersion: '1',
        fileName: 'file.docx',
        pageCount: 1,
        status: 'RENDERED',
      } satisfies RenderDetailsRendered;

      expect(getRenderDetails(template, renderKey)).toEqual({
        rendered: true,
        src: `/templates/files/${template.clientId}/renders/${template.id}/${template.files[renderKey].fileName}`,
      });
    });

    it('returns rendered - false and no url if status is FAILED', () => {
      const template = {
        ...AUTHORING_LETTER_TEMPLATE,
      };

      template.files[renderKey] = {
        status: 'FAILED',
      } satisfies RenderDetailsFailed;

      expect(getRenderDetails(template, renderKey)).toEqual({
        rendered: false,
      });
    });

    it('returns rendered - false and no url if status is PENDING', () => {
      const template = {
        ...AUTHORING_LETTER_TEMPLATE,
      };

      template.files[renderKey] = {
        status: 'PENDING',
        requestedAt: '',
      } satisfies RenderDetailsPending;

      expect(getRenderDetails(template, renderKey)).toEqual({
        rendered: false,
      });
    });
  });

  describe.each(['longFormRender', 'shortFormRender'] as Exclude<
    RenderedFileKey,
    'initialRender'
  >[])('render is not present - %s', (renderKey) => {
    it('returns rendered - false and no url', () => {
      const template = {
        ...AUTHORING_LETTER_TEMPLATE,
      };

      template.files[renderKey] = undefined;

      expect(getRenderDetails(template, renderKey)).toEqual({
        rendered: false,
      });
    });
  });
});
