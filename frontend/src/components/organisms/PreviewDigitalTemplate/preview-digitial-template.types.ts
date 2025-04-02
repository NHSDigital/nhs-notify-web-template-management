import { PreviewTemplateDetails } from '@molecules/PreviewTemplateDetails/PreviewTemplateDetails';
import { NHSNotifyRadioButtonFormProps } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { TemplateDto } from 'nhs-notify-backend-client';

export type PreviewTemplateProps = {
  sectionHeading: string | undefined;
  template: TemplateDto;

  form: {
    errorHeading: string;
  } & NHSNotifyRadioButtonFormProps;
  previewDetailsComponent: React.ReactElement<typeof PreviewTemplateDetails>;
};
