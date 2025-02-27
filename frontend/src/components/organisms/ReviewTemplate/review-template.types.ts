import { PreviewTemplate } from '@molecules/PreviewTemplate/PreviewTemplate';
import { NHSNotifyRadioButtonFormProps } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { Template } from 'nhs-notify-web-template-management-utils';

export type ReviewTemplateProps = {
  sectionHeading: string | undefined;
  template: Template;
  form: {
    errorHeading: string;
  } & NHSNotifyRadioButtonFormProps;
  PreviewComponent: React.ReactElement<typeof PreviewTemplate>;
};
