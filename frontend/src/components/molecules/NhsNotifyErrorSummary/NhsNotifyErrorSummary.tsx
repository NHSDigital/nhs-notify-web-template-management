import { ErrorSummary, HintText } from 'nhsuk-react-components';
import { ErrorState } from 'nhs-notify-web-template-management-utils';
import { FC, HTMLProps, useEffect, useRef } from 'react';
import content from '@content/content';
import { renderErrorItem } from '@molecules/NhsNotifyErrorItem/NHSNotifyErrorItem';

const UnlinkedErrorSummaryItem: FC<HTMLProps<HTMLSpanElement>> = (props) => (
  <li>
    <span className='nhsuk-error-message' {...props} />
  </li>
);

/**
 * Handles clicks on error summary links that point to form fields inside unselected NHS UK tab panels.
 * Iff the target field is inside a hidden tab panel (`nhsuk-tabs__panel--hidden`), the default
 * navigation is prevented, the correct tab is activated by programmatically clicking its tab link,
 * and then focus is moved to the field once the panel becomes visible.
 */
function handleErrorLinkClick(e: MouseEvent) {
  if (!(e.target instanceof HTMLElement)) return;
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const href = link.getAttribute('href');
  /* istanbul ignore next — `closest('a[href^="#"]')` guarantees href is non-null */
  if (!href) return;

  const fieldId = href.slice(1);
  const target = document.querySelector<HTMLElement>(`#${CSS.escape(fieldId)}`);
  if (!target) return;

  const panel = target.closest<HTMLElement>('.nhsuk-tabs__panel');
  if (!panel?.classList.contains('nhsuk-tabs__panel--hidden')) return;

  e.preventDefault();

  const panelId = panel.id;
  const tabLink = document.querySelector<HTMLAnchorElement>(
    `[aria-controls="${panelId}"].nhsuk-tabs__tab`
  );
  tabLink?.click();

  requestAnimationFrame(() => {
    document.querySelector<HTMLElement>(`#${CSS.escape(fieldId)}`)?.focus();
  });
}

export type NhsNotifyErrorSummaryProps = {
  hint?: string;
  errorState?: ErrorState;
};

export const NhsNotifyErrorSummary = ({
  hint,
  errorState = {},
}: NhsNotifyErrorSummaryProps) => {
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errorState && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
      errorSummaryRef.current.scrollIntoView();
    }
  }, [errorState]);

  // handle error link clicks to fields inside hidden tab panels
  useEffect(() => {
    const el = errorSummaryRef.current;
    if (!el) return;
    el.addEventListener('click', handleErrorLinkClick);
    return () => el.removeEventListener('click', handleErrorLinkClick);
  }, [errorState]);

  const { fieldErrors, formErrors } = errorState;

  const showErrorSummary =
    (fieldErrors && Object.values(fieldErrors).some(Boolean)) ||
    (formErrors && formErrors.length > 0);

  if (!showErrorSummary) {
    return;
  }

  const renderedFieldErrors =
    fieldErrors &&
    Object.entries(fieldErrors).map(([id, errors]) =>
      errors.map((error) => (
        <ErrorSummary.Item
          href={`#${id}`}
          key={`field-error-summary-${id}-${error.slice(0, 5)}`}
        >
          {renderErrorItem(error)}
        </ErrorSummary.Item>
      ))
    );

  return (
    <ErrorSummary ref={errorSummaryRef}>
      <ErrorSummary.Title data-testid='error-summary'>
        {content.components.errorSummary.heading}
      </ErrorSummary.Title>
      {hint && <HintText>{hint}</HintText>}
      <ErrorSummary.List>
        {renderedFieldErrors}
        {formErrors &&
          formErrors.map((error, id) => (
            <UnlinkedErrorSummaryItem key={`form-error-summary-${id}`}>
              {error}
            </UnlinkedErrorSummaryItem>
          ))}
      </ErrorSummary.List>
    </ErrorSummary>
  );
};
