import { Radios } from 'nhsuk-react-components';
import { Preview } from '@molecules/Preview/Preview';

export type PreviewMessageProps = {
  sectionHeading: string;
  templateName: string;
  details: {
    heading: string;
    text: string[];
  };
  PreviewComponent: React.ReactElement<typeof Preview>;
  FormOptionsComponent: React.ReactElement<typeof Radios>;
};
