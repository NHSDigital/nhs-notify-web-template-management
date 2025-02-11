'use server';

import { ChooseTemplate } from '@forms/ChooseTemplate/ChooseTemplate';
import { getCsrfFormValue } from '@utils/csrf-utils';

const ChooseATemplateTypePage = async () => {
  const csrfToken = await getCsrfFormValue();

  return <ChooseTemplate csrfToken={csrfToken} />;
};

export default ChooseATemplateTypePage;
