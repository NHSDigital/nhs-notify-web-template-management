import { MarkdownItWrapper } from '@utils/markdownit';

export type Dependencies = {
  markdownClient: MarkdownItWrapper;
};

export interface IPreviewTextMessageActions {
  renderMarkdown(value: string): string;
}

export type PreviewTextMessageProps = {
  templateName: string;
  message: string;
  pageActions: IPreviewTextMessageActions;
};
