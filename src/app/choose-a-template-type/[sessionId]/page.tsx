'use server';

import { ChooseTemplate } from '@forms/ChooseTemplate/ChooseTemplate';
import { getSession } from '@utils/form-actions';
import { PageProps } from '@utils/types';

const ChooseATemplateTypePage = async ({
  params: { sessionId },
}: PageProps) => {
  const session = await getSession(sessionId);

  return <ChooseTemplate initialState={session} />;
};

export default ChooseATemplateTypePage;
