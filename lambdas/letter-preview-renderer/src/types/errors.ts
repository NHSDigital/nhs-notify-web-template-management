export type RenderFailureReason =
  | 'source-fetch'
  | 'marker-extraction'
  | 'render'
  | 'page-count'
  | 'save-pdf'
  | 'db-update';

/**
 * Error thrown when the render pipeline fails at a known step.
 * These are expected failures that should mark the template as non-renderable.
 */
export class RenderFailureError extends Error {
  constructor(
    public readonly reason: RenderFailureReason,
    public readonly cause?: unknown
  ) {
    super(`Render failed: ${reason}`);
    this.name = 'RenderFailureError';
  }
}

/**
 * Error thrown when the template contains markers that cannot be rendered.
 * This is a validation failure, not an infrastructure failure.
 */
export class NonRenderableMarkersError extends Error {
  constructor(public readonly markers: string[]) {
    super(`Template contains non-renderable markers: ${markers.join(', ')}`);
    this.name = 'NonRenderableMarkersError';
  }
}
