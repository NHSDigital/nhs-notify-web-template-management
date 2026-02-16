export type RenderFailureReason =
  | 'source-fetch'
  | 'marker-extraction'
  | 'render'
  | 'page-count'
  | 'save-pdf'
  | 'db-update';

export class RenderFailureError extends Error {
  constructor(
    public readonly reason: RenderFailureReason,
    public readonly cause?: unknown
  ) {
    super(`Render failed: ${reason}`);
    this.name = 'RenderFailureError';
  }
}

export class NonRenderableMarkersError extends Error {
  constructor(public readonly markers: string[]) {
    super(`Template contains non-renderable markers: ${markers.join(', ')}`);
    this.name = 'NonRenderableMarkersError';
  }
}
