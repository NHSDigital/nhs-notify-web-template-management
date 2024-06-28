import { MarkdownItWrapper } from '@utils/markdownit';

export type Dependencies = {
  markdownClient: MarkdownItWrapper;
};

export interface IPreviewLetterActions {
  renderMarkdown(value: string): string;
}

export type PreviewLetterProps = {
  templateName: string;
  heading: string;
  bodyText: string;
  pageActions: IPreviewLetterActions;
};
