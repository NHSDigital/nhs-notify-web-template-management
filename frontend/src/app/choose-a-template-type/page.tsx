'use server';

import { ChooseTemplate } from '@forms/ChooseTemplate/ChooseTemplate';
import { Metadata } from 'next';
import { TEMPLATE_TYPE_LIST } from 'nhs-notify-backend-client';
import content from '@content/content';

const { pageTitle } = content.components.chooseTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const ChooseATemplateTypePage = async () => {
  return <ChooseTemplate templateTypes={TEMPLATE_TYPE_LIST} />;
};

export default ChooseATemplateTypePage;
