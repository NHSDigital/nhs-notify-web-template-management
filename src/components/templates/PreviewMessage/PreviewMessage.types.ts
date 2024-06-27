import { Radios } from 'nhsuk-react-components';
import { Preview } from '../../molecules/Preview/Preview';

export const PREVIEW_TYPES = [
  'Email',
  'NHS app message',
  'Text message',
  'Letter',
] as const;

export type PreviewType = (typeof PREVIEW_TYPES)[number];

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
