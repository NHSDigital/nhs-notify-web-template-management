'use server';

import { ChooseTemplate } from '@forms/ChooseTemplate/ChooseTemplate';
import { TEMPLATE_TYPE_LIST } from 'nhs-notify-backend-client';

const ChooseATemplateTypePage = async () => {
  const templateTypes = TEMPLATE_TYPE_LIST.filter(
    (t) => process.env.NEXT_PUBLIC_ENABLE_LETTERS === 'true' || t !== 'LETTER'
  );

  return <ChooseTemplate templateTypes={templateTypes} />;
};

export default ChooseATemplateTypePage;
