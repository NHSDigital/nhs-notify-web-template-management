import { MarkdownItWrapper } from '@utils/markdownit';
import { Dependencies, IPreviewEmailActions } from './PreviewEmail.types';

export class PreviewEmailActions implements IPreviewEmailActions {
  private readonly _markdownClient: MarkdownItWrapper;

  constructor(
    _container: Dependencies = { markdownClient: new MarkdownItWrapper() }
  ) {
    this._markdownClient = _container.markdownClient
      .enableLineBreak()
      .enable(['heading', 'link', 'list', 'hr']);
  }

  renderMarkdown(value: string) {
    'use server';
    return this._markdownClient.render(value);
  }

  formAction(value: string) {
    'use server';
    // TODO: handle form actions
  }
}
