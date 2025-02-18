import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { notFound } from 'next/navigation';

const CreateLetterTemplatePage = async () => {
  if (!process.env.NEXT_PUBLIC_ENABLE_LETTERS) notFound();

  return (
    <NHSNotifyMain>
      <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
        Create letter template
      </h1>
      <p id='placeholder'>🚧 Placeholder 🚧</p>
    </NHSNotifyMain>
  );
};

export default CreateLetterTemplatePage;
