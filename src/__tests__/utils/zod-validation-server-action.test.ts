import { z } from 'zod';
import { TemplateFormState, TemplateType } from '../../utils/types';
import { zodValidationServerAction } from '../../utils/zod-validation-server-action';
import { getMockFormData } from '../helpers';

const formState: TemplateFormState = {
  validationError: undefined,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
  templateType: TemplateType.NHS_APP,
  id: 'session-id',
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
    id: 'session-id',
    templateType: 'NHS_APP',
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
    id: 'session-id',
    templateType: 'NHS_APP',
    validationError: undefined,
    nhsAppTemplateName: 'p',
    nhsAppTemplateMessage: '',
  });
});

test('returns as expected on valid formData when page is specified', () => {
  const result = zodValidationServerAction(
    formState,
    getMockFormData({ nhsAppTemplateName: 'p' }),
    formSchema
  );

  expect(result).toEqual({
    id: 'session-id',
    templateType: 'NHS_APP',
    validationError: undefined,
    nhsAppTemplateName: 'p',
    nhsAppTemplateMessage: '',
  });
});
