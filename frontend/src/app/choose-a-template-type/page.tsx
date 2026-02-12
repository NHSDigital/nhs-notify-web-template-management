'use server';

import { ChooseTemplateType } from '@forms/ChooseTemplateType/ChooseTemplateType';
import { Metadata } from 'next';
import { TEMPLATE_TYPE_LIST } from 'nhs-notify-backend-client';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';

const { pageTitle } = content.components.chooseTemplateType;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const ChooseATemplateTypePage = async () => {
  return (
    <NHSNotifyContainer>
      <ChooseTemplateType templateTypes={TEMPLATE_TYPE_LIST} />
    </NHSNotifyContainer>
  );
};

export default ChooseATemplateTypePage;
