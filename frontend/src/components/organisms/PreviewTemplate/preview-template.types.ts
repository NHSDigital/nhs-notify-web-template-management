import { PreviewTemplateDetails } from '@molecules/PreviewTemplateDetails/PreviewTemplateDetails';
import { NHSNotifyRadioButtonFormProps } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { TemplateDTO } from 'nhs-notify-backend-client';

export type PreviewTemplateProps = {
  sectionHeading: string | undefined;
  template: TemplateDTO;
  form: {
    errorHeading: string;
  } & NHSNotifyRadioButtonFormProps;
  previewDetailsComponent: React.ReactElement<typeof PreviewTemplateDetails>;
};
