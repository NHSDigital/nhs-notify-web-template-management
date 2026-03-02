import type { RenderDetails } from 'nhs-notify-web-template-management-types';

export function isRenderAlreadyStale(
  render: RenderDetails,
  timeoutMs: number
): boolean {
  if (render.status !== 'PENDING') return false;

  const elapsed = Date.now() - new Date(render.requestedAt).getTime();

  return elapsed >= timeoutMs;
}
