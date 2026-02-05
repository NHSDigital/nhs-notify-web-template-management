import { FormStateFields } from 'nhs-notify-web-template-management-utils';

/**
 * Use in server actions to parse a form data object into form state that can be returned to the client when using `useActionState`
 * @param formData `FormData` object to parse
 * @returns `FormStateFields`
 */
export function formDataToFormStateFields(formData: FormData): FormStateFields {
  const fields: FormStateFields = {};

  for (const [key, value] of formData.entries()) {
    if (value !== null && !(value instanceof File)) {
      fields[key] = value;
    }
  }

  return fields;
}
