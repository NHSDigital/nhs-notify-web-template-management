import { PreviewTemplate } from '@molecules/PreviewTemplate/PreviewTemplate';
import { NHSNotifyRadioButtonFormProps } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';

export type ReviewTemplateProps = {
  sectionHeading: string;
  templateName: string;
  details: {
    heading: string;
    text: { id: string; text: string }[];
  };
  form: {
    errorHeading: string;
  } & NHSNotifyRadioButtonFormProps;
  PreviewComponent: React.ReactElement<typeof PreviewTemplate>;
};
