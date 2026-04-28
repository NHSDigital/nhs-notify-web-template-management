'use client';

import { useEffect } from 'react';
import type { MouseEvent } from 'react';
import { useNHSNotifyForm } from '@providers/form-provider';
import { useLetterRenderError } from '@providers/letter-render-error-provider';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';

/**
 * Handles clicks on error summary links that point to form fields inside unselected NHS UK tab panels.
 * If the target field is inside a hidden tab panel (`nhsuk-tabs__panel--hidden`), the default
 * navigation is prevented, the correct tab is activated by programmatically clicking its tab link,
 * and then focus is moved to the field once the panel becomes visible.
 */
function handleErrorLinkClick(fieldId: string) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.querySelector<HTMLElement>(
      `#${CSS.escape(fieldId)}`
    );

    console.log(fieldId, target);
    if (!target) return;

    const panel = target.closest<HTMLElement>('.nhsuk-tabs__panel');

    console.log(panel);
    if (!panel?.classList.contains('nhsuk-tabs__panel--hidden')) return;

    e.preventDefault();

    const panelId = panel.id;
    const tabLink = document.querySelector<HTMLAnchorElement>(
      `[aria-controls="${panelId}"].nhsuk-tabs__tab`
    );

    console.log(panelId, tabLink);
    tabLink?.click();

    requestAnimationFrame(() => {
      target.focus();
    });
  };
}

/**
 * Displays validation errors for both the letter rendering component and a parent form.
 * Error state is stored in LetterRenderErrorProvider so it can be cleared when either form is submitted.
 *
 * Must be rendered inside NHSNotifyFormProvider (for the parent action state)
 * and LetterRenderErrorProvider.
 */
export function CombinedLetterErrorSummary() {
  const [state] = useNHSNotifyForm();

  const { setParentErrorState, parentErrorState, letterRenderErrorState } =
    useLetterRenderError();

  useEffect(() => {
    setParentErrorState(state.errorState);
  }, [state, setParentErrorState]);

  return (
    <NhsNotifyErrorSummary
      errorState={parentErrorState || letterRenderErrorState}
      onItemClick={handleErrorLinkClick}
    />
  );
}
