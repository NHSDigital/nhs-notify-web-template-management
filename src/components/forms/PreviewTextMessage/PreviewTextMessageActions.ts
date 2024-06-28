import { MarkdownItWrapper } from '@utils/markdownit';
import {
  Dependencies,
  IPreviewTextMessageActions,
} from './PreviewTextMessage.types';

export class PreviewTextMessageActions implements IPreviewTextMessageActions {
  private readonly _markdownClient: MarkdownItWrapper;

  constructor(
    _container: Dependencies = { markdownClient: new MarkdownItWrapper() }
  ) {
    this._markdownClient = _container.markdownClient;
  }

  renderMarkdown(value: string) {
    'use server';
    return this._markdownClient.render(value);
  }
}
