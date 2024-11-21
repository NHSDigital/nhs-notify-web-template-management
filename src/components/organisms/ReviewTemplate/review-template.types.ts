import { PreviewTemplate } from '@molecules/PreviewTemplate/PreviewTemplate';
import { NHSNotifyRadioButtonFormProps } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { ChannelTemplate } from '@utils/types';

export type ReviewTemplateProps = {
  sectionHeading: string;
  template: ChannelTemplate;
  form: {
    errorHeading: string;
  } & NHSNotifyRadioButtonFormProps;
  PreviewComponent: React.ReactElement<typeof PreviewTemplate>;
};
