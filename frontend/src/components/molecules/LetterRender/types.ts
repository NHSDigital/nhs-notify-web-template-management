export type LetterPreviewVariant = 'short' | 'long';

/**
 * Form data for a single variant (short or long)
 */
export type LetterRenderFormData = {
  systemPersonalisationPackId: string;
  personalisationParameters: Record<string, string>;
};

/**
 * Preview state for a single variant
 * - idle: initial state, showing existing render or initialRender
 * - loading: spinner shown while generating new preview (future: CCM-13495)
 * - error: failed to generate preview
 * - ready: new preview available
 */
export type PreviewState = 'idle' | 'loading' | 'error' | 'ready';

/**
 * State for a single variant tab
 */
export type VariantState = {
  formData: LetterRenderFormData;
  previewState: PreviewState;
  pdfUrl: string | null;
  errors: Record<string, string[]>;
};

/**
 * Combined state for both tabs
 */
export type LetterRenderState = {
  short: VariantState;
  long: VariantState;
};

/**
 * Result from the server action
 */
export type UpdatePreviewResult = {
  success: boolean;
  pdfUrl?: string;
  errors?: Record<string, string[]>;
};
