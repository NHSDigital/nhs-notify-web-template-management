'use server';

const NhsAppTemplateSubmittedPage = async ({
  params,
}: {
  params: { templateId: string };
}) => (
  <h2 className='nhsuk-heading-l' data-testid='page-sub-heading'>
    Placeholder page
    <p>{params.templateId}</p>
  </h2>
);

export default NhsAppTemplateSubmittedPage;
