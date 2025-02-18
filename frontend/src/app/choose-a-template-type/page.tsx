'use server';

import { ChooseTemplate } from '@forms/ChooseTemplate/ChooseTemplate';
import { TemplateType } from 'nhs-notify-backend-client';

const ChooseATemplateTypePage = async () => {
  const templateTypes = Object.values(TemplateType).filter(
    (t) => process.env.ENABLE_LETTERS || t !== TemplateType.LETTER
  );

  return <ChooseTemplate templateTypes={templateTypes} />;
};

export default ChooseATemplateTypePage;
