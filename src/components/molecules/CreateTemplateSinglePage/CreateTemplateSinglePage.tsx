'use client';

import { useFormState } from 'react-dom';
import { FC } from 'react';
import { ReviewNHSAppTemplate } from '@forms/ReviewNHSAppTemplate';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { ChooseTemplate } from '@forms/ChooseTemplate/ChooseTemplate';
import { CreateNhsAppTemplate } from '@forms/CreateNhsAppTemplate/CreateNhsAppTemplate';
import { CreateSmsTemplate } from '@forms/CreateSmsTemplate/CreateSmsTemplate';
import { CreateEmailTemplate } from '@forms/CreateEmailTemplate/CreateEmailTemplate';
import { CreateLetterTemplate } from '@forms/CreateLetterTemplate/CreateLetterTemplate';
import { mainServerAction } from '@app/create-template/main-server-action';
import {
  Page,
  PageComponentProps,
  TemplateFormState,
} from '../../../utils/types';

const pages: Record<Page, FC<PageComponentProps>> = {
  'choose-template': ChooseTemplate,
  'create-nhs-app-template': CreateNhsAppTemplate,
  'create-email-template': CreateEmailTemplate,
  'create-sms-template': CreateSmsTemplate,
  'create-letter-template': CreateLetterTemplate,
  'review-nhs-app-template': ReviewNHSAppTemplate,
  'submit-template': SubmitTemplate,
};
type CreateTemplatePageProps = {
  initialState: TemplateFormState;
};

export const CreateTemplateSinglePage = ({
  initialState,
}: CreateTemplatePageProps) => {
  const [state, action] = useFormState(mainServerAction, initialState);
  const { page } = state;

  const PageComponent = pages[page];

  return <PageComponent state={state} action={action} />;
};
