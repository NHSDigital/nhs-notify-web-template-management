'use server';

import { ChooseTemplate } from '@forms/ChooseTemplate/ChooseTemplate';
import { TemplateType } from 'nhs-notify-backend-client';

const ChooseATemplateTypePage = async () => {
  const templateTypes = Object.values(TemplateType).filter(
    (t) =>
      process.env.NEXT_PUBLIC_ENABLE_LETTERS === 'true' ||
      t !== 'LETTER'
  );

  return <ChooseTemplate templateTypes={templateTypes} />;
};

export default ChooseATemplateTypePage;
