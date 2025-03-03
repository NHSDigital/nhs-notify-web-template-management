import { PreviewTemplateDetails } from '@molecules/PreviewTemplateDetails/PreviewTemplateDetails';
import { NHSNotifyRadioButtonFormProps } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { Template } from 'nhs-notify-web-template-management-utils';

export type PreviewTemplateProps = {
  sectionHeading: string | undefined;
  template: Template;
  form: {
    errorHeading: string;
  } & NHSNotifyRadioButtonFormProps;
  previewDetailsComponent: React.ReactElement<typeof PreviewTemplateDetails>;
};
