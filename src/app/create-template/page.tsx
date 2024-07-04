'use client';
import { ChooseTemplate } from '../../components/forms/ChooseTemplate/ChooseTemplate';
import { CreateNhsAppTemplate } from '../../components/forms/CreateNhsAppTemplate/CreateNhsAppTemplate';
import { CreateSmsTemplate } from '../../components/forms/CreateSmsTemplate/CreateSmsTemplate';
import { CreateEmailTemplate } from '../../components/forms/CreateEmailTemplate/CreateEmailTemplate';
import { CreateLetterTemplate } from '../../components/forms/CreateLetterTemplate/CreateLetterTemplate';
import { ReviewNhsAppTemplate } from '../../components/forms/ReviewNhsAppTemplate/ReviewNhsAppTemplate';
import { mainServerAction } from './main-server-action';
import { FormState, Page, PageComponentProps } from '../../utils/types';
import { useFormState } from 'react-dom';
import { FC, useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';

const pages: Record<Page, FC<PageComponentProps>> = {
  'choose-template': ChooseTemplate,
  'create-nhs-app-template': CreateNhsAppTemplate,
  'create-email-template': CreateEmailTemplate,
  'create-sms-template': CreateSmsTemplate,
  'create-letter-template': CreateLetterTemplate,
  'review-nhs-app-template': ReviewNhsAppTemplate,
};

const initialState: FormState = {
  page: 'choose-template',
  validationError: null,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

const CreateTemplate = () => {
  const [state, action] = useFormState(mainServerAction, initialState);
  const { page } = state;

  const PageComponent = pages[page];

  return <PageComponent state={state} action={action} />;
};

export default CreateTemplate;
