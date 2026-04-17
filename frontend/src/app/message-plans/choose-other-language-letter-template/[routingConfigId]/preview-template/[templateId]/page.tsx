import {
  MessagePlanAndTemplatePageProps,
  validateForeignLanguageLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { Metadata } from 'next';
import content from '@content/content';
import { PreviewLetterFromChooseTemplate } from '@molecules/PreviewLetterFromChooseTemplate/PreviewLetterFromChooseTemplate';

const { pageTitle } = content.pages.previewOtherLanguageLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const PreviewOtherLanguageLetterTemplateFromMessagePlan = async (
  props: MessagePlanAndTemplatePageProps
) => {
  const { routingConfigId } = await props.params;
  return (
    <PreviewLetterFromChooseTemplate
      {...props}
      validateTemplate={validateForeignLanguageLetterTemplate}
      redirectUrlOnLockNumberFailure={`/message-plans/edit-message-plan/${routingConfigId}`}
    />
  );
};

export default PreviewOtherLanguageLetterTemplateFromMessagePlan;
