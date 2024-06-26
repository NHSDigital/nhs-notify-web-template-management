type PreviewHeadingsType = 'Heading' | 'Body text' | 'Subject' | 'Message';

export type PreviewProps = {
  preview: {
    heading: PreviewHeadingsType;
    value: string;
  }[];
};
