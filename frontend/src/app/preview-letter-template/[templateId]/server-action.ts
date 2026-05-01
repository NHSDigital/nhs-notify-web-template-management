'use server';

import { z } from 'zod/v4';
import type { FormState } from '@utils/types';
import { redirect } from 'next/navigation';
import content from '@content/content';
import { ErrorCodes } from '@utils/error-codes';
import { $FormSchema } from './server-action-form-schema';
import { getSheetCount } from '@utils/get-sheet-count';

const { approveErrors } = content.pages.previewLetterTemplate;

export async function submitAuthoringLetterAction(
  _: FormState,
  form: FormData
): Promise<FormState> {
  const result = $FormSchema.safeParse(Object.fromEntries(form.entries()));

  if (result.error) {
    return {
      errorState: z.flattenError(result.error),
    };
  }

  const {
    templateId,
    lockNumber,
    shortFormRenderStatus,
    longFormRenderStatus,
    letterVariantBothSidesFlag,
    letterVariantMaxSheets,
    longRenderPageCount,
    shortRenderPageCount,
    templatePageCount,
    letterVariantId,
  } = result.data;

  const fieldErrors: Record<string, string[]> = {};

  if (shortFormRenderStatus !== 'RENDERED') {
    fieldErrors['tab-short'] = [approveErrors.shortExampleRequired];
  }

  if (longFormRenderStatus !== 'RENDERED') {
    fieldErrors['tab-long'] = [approveErrors.longExampleRequired];
  }

  if (!letterVariantId) {
    // if we have this error we do not want to calculate the other letter-variant-related errors
    fieldErrors['printing-and-postage'] = [approveErrors.letterVariantRequired];
    return { errorState: { fieldErrors } };
  }

  if (
    getSheetCount(templatePageCount, letterVariantBothSidesFlag) >
    letterVariantMaxSheets
  ) {
    // if we have this error we do not want to show the personalised render errors
    fieldErrors['printing-and-postage'] = [
      ErrorCodes.INITIAL_RENDER_CONTAINS_TOO_MANY_SHEETS,
    ];
    return { errorState: { fieldErrors } };
  }

  if (
    getSheetCount(shortRenderPageCount, letterVariantBothSidesFlag) >
    letterVariantMaxSheets
  ) {
    fieldErrors['printing-and-postage'] = [
      ...(fieldErrors['printing-and-postage'] ?? []),
      ErrorCodes.SHORT_RENDER_CONTAINS_TOO_MANY_SHEETS,
    ];
  }

  if (
    getSheetCount(longRenderPageCount, letterVariantBothSidesFlag) >
    letterVariantMaxSheets
  ) {
    fieldErrors['printing-and-postage'] = [
      ...(fieldErrors['printing-and-postage'] ?? []),
      ErrorCodes.LONG_RENDER_CONTAINS_TOO_MANY_SHEETS,
    ];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { errorState: { fieldErrors } };
  }

  redirect(
    `/get-ready-to-approve-letter-template/${templateId}?lockNumber=${lockNumber}`
  );
}
