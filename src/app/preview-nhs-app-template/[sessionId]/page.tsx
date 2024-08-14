'use server';

import { ReviewNHSAppTemplate } from '@forms/ReviewNHSAppTemplate/ReviewNHSAppTemplate';
import { PageProps } from '@utils/types';
import { getSession } from '@utils/form-actions';

const PreviewNhsAppTemplatePage = async ({
  params: { sessionId },
}: PageProps) => {
  const session = await getSession(sessionId);

  return <ReviewNHSAppTemplate initialState={session} />;
};

export default PreviewNhsAppTemplatePage;
