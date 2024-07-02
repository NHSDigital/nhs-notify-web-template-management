import { Preview } from '@molecules/Preview/Preview';
import { NHSNotifyRadioButtonFormProps } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';

export type PreviewMessageProps = {
  sectionHeading: string;
  templateName: string;
  details: {
    heading: string;
    text: string[];
  };
  form: {
    errorHeading: string;
  } & NHSNotifyRadioButtonFormProps;
  PreviewComponent: React.ReactElement<typeof Preview>;
};
