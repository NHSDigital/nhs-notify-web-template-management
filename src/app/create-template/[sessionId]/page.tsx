'use server';

import { getSession } from '@/src/utils/form-actions';
import { CreateTemplateSinglePage } from '@/src/components/molecules/CreateTemplateSinglePage/CreateTemplateSinglePage';
import { FormState } from '../../../utils/types';

type CreateTemplateProps = {
  params: {
    sessionId: string;
  };
};

const CreateTemplate = async ({
  params: { sessionId },
}: CreateTemplateProps) => {
  const session = await getSession(sessionId);

  const formState: FormState = {
    sessionId,
    ...session,
    page: 'choose-template',
  };

  return <CreateTemplateSinglePage initialState={formState} />;
};

export default CreateTemplate;
