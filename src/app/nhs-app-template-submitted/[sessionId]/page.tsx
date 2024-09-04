'use server';

const NhsAppTemplateSubmittedPage = async ({ params }: { params: { templateId: string} }) => (
  <h2 className='nhsuk-heading-l' data-testid='page-sub-heading'>
    Placeholder page
    {params.templateId}
  </h2>
);

export default NhsAppTemplateSubmittedPage;
