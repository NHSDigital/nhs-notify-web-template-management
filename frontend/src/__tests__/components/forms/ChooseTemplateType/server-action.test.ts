import { chooseTemplateTypeAction } from '@forms/ChooseTemplateType/server-action';
import { getMockFormData } from '@testhelpers/helpers';
import { redirect, RedirectType } from 'next/navigation';
import { serverIsFeatureEnabled } from '@utils/server-features';

jest.mock('next/navigation');

jest.mock('@utils/amplify-utils');

jest.mock('@utils/server-features', () => ({
  serverIsFeatureEnabled: jest.fn(),
}));

describe('chooseTemplateTypeAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with letterAuthoring feature disabled', () => {
    beforeEach(() => {
      jest.mocked(serverIsFeatureEnabled).mockResolvedValue(false);
    });

    test('validation error when templateType is invalid', async () => {
      const response = await chooseTemplateTypeAction(
        {},
        getMockFormData({
          'form-id': 'create-nhs-app-template',
          templateType: 'lemons',
        })
      );

      expect(response).toEqual({
        errorState: {
          formErrors: [],
          fieldErrors: {
            templateType: ['Select a template type'],
          },
        },
      });
    });

    test.each([
      ['NHS_APP', '/create-nhs-app-template'],
      ['SMS', '/create-text-message-template'],
      ['EMAIL', '/create-email-template'],
      ['LETTER', '/upload-letter-template'],
    ])('redirects to legacy URL for %s', async (templateType, expectedUrl) => {
      const mockRedirect = jest.mocked(redirect);

      await chooseTemplateTypeAction(
        {},
        getMockFormData({
          templateType,
        })
      );

      expect(mockRedirect).toHaveBeenCalledWith(expectedUrl, RedirectType.push);
    });
  });

  describe('with letterAuthoring feature enabled', () => {
    beforeEach(() => {
      jest.mocked(serverIsFeatureEnabled).mockResolvedValue(true);
    });

    test('sets validation error when templateType is invalid', async () => {
      const response = await chooseTemplateTypeAction(
        {},
        getMockFormData({
          templateType: 'invalid',
        })
      );

      expect(response).toEqual({
        errorState: {
          formErrors: [],
          fieldErrors: {
            templateType: ['Select a template type'],
          },
        },
      });
    });

    describe('for non-LETTER template type', () => {
      test.each([
        ['NHS_APP', '/create-nhs-app-template'],
        ['SMS', '/create-text-message-template'],
        ['EMAIL', '/create-email-template'],
      ])(
        'redirects to correct creation URL for %s',
        async (templateType, expectedUrl) => {
          const mockRedirect = jest.mocked(redirect);

          await chooseTemplateTypeAction(
            {},
            getMockFormData({
              templateType,
            })
          );

          expect(mockRedirect).toHaveBeenCalledWith(
            expectedUrl,
            RedirectType.push
          );
        }
      );
    });

    describe('for LETTER template type', () => {
      test('returns validation error when LETTER selected but letterType missing', async () => {
        const response = await chooseTemplateTypeAction(
          {},
          getMockFormData({
            templateType: 'LETTER',
          })
        );

        expect(response).toEqual({
          errorState: {
            formErrors: [],
            fieldErrors: {
              letterType: ['Select a letter template type'],
            },
          },
        });
      });

      test('returns validation error when letterType is invalid', async () => {
        const response = await chooseTemplateTypeAction(
          {},
          getMockFormData({
            templateType: 'LETTER',
            letterType: 'invalid',
          })
        );

        expect(response).toEqual({
          errorState: {
            formErrors: [],
            fieldErrors: {
              letterType: ['Select a letter template type'],
            },
          },
        });
      });

      test.each([
        ['x0', '/upload-standard-english-letter-template'],
        ['x1', '/upload-large-print-letter-template'],
        ['q4', '/upload-british-sign-language-letter-template'],
        ['language', '/upload-other-language-letter-template'],
      ])(
        'redirects to letter authoring URL for %s letter type',
        async (letterType, expectedUrl) => {
          const mockRedirect = jest.mocked(redirect);

          await chooseTemplateTypeAction(
            {},
            getMockFormData({
              templateType: 'LETTER',
              letterType,
            })
          );

          expect(mockRedirect).toHaveBeenCalledWith(
            expectedUrl,
            RedirectType.push
          );
        }
      );
    });
  });
});
