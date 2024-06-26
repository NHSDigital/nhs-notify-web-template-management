import { z } from 'zod';
import { FormState } from '../../utils/types';
import { zodValidationServerAction } from '../../utils/zod-validation-server-action';
import { getMockFormData } from '../helpers';

const formState: FormState = {
  page: 'choose-template',
  validationError: null,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

const formSchema = z.object({
  nhsAppTemplateName: z.string().max(5, { message: 'content too long' }),
});

test('returns as expected on invalid formData', () => {
  const result = zodValidationServerAction(
    formState,
    getMockFormData({ nhsAppTemplateName: 'form-data' }),
    formSchema
  );

  expect(result).toEqual({
    page: 'choose-template',
    validationError: {
      formErrors: [],
      fieldErrors: {
        nhsAppTemplateName: ['content too long'],
      },
    },
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
  });
});

test('returns as expected on valid formData', () => {
  const result = zodValidationServerAction(
    formState,
    getMockFormData({ nhsAppTemplateName: 'p' }),
    formSchema
  );

  expect(result).toEqual({
    page: 'choose-template',
    validationError: null,
    nhsAppTemplateName: 'p',
    nhsAppTemplateMessage: '',
  });
});

test('returns as expected on valid formData when page is specified', () => {
  const result = zodValidationServerAction(
    formState,
    getMockFormData({ nhsAppTemplateName: 'p' }),
    formSchema,
    'review-nhs-app-template'
  );

  expect(result).toEqual({
    page: 'review-nhs-app-template',
    validationError: null,
    nhsAppTemplateName: 'p',
    nhsAppTemplateMessage: '',
  });
});
