'use server';

import { CreateNhsAppTemplate } from '@forms/CreateNhsAppTemplate/CreateNhsAppTemplate';
import { PageProps } from '@utils/types';
import { getSession } from '@utils/form-actions';

const CreateNhsAppTemplatePage = async ({
  params: { sessionId },
}: PageProps) => {
  const session = await getSession(sessionId);

  return <CreateNhsAppTemplate initialState={session} />;
};

export default CreateNhsAppTemplatePage;
