import { Radios } from 'nhsuk-react-components';
import { Preview } from '../../molecules/Preview/Preview';

type PreviewType = 'Email' | 'NHS app message' | 'Text message' | 'Letter';

export type PreviewMessageProps = {
  type: PreviewType;
  templateName: string;
  details: {
    heading: string;
    text: string[];
  };
  PreviewComponent: React.ReactElement<typeof Preview>;
  FormOptionsComponent: React.ReactElement<typeof Radios>;
};
